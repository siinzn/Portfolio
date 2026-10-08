---
title: "Threshold"
date: "04-10-2026"
description: "A multi agent Q-learning simulation of how different people respond to the same shock"
---

## Introduction

Threshold is a multi agent simulation where around 50 agents, each with their own traits like health, savings, risk tolerance and social support, all get hit by the exact same shock, but react completely differently depending on who they are. Instead of scripting out if else rules for how each agent should behave, every agent learns its own behavior over time using tabular Q-learning. The whole point was to see if diverse, emergent behavior could show up purely from individual differences reacting to one shared cause, not from me hardcoding it.

## The idea and why i wanted to build it

I wanted to do a python project that wasnt just another CRUD app or a tutorial clone. I had this idea stuck in my head about how the same event, like a price spike or a heatwave, hits everyone but doesnt affect everyone the same way. Someone with savings and a strong support system shrugs it off, someone without either gets wrecked. I thought that would be a genuinely interesting thing to simulate, and reinforcement learning felt like the right tool since i didnt want to manually write out what each agent "should" do, i wanted them to figure it out themselves through trial and error.

Problem was i knew basically nothing about Q-learning going in.

## Learning Q-learning (and forgetting it, twice)

Before touching my own project i did the classic FrozenLake tabular Q-learning example from gymnasium, following along with their tutorial to actually see a Q-table fill up with real numbers instead of just reading about it in theory. That helped a lot, i finally understood what a Q-table actually is, just a lookup of state and action pairs with a number saying how good that action was historically.

Funny thing is i ended up losing touch with this project for stretches of time, once for about a month, and once for about 5 days right in the middle of actually implementing Q-learning. Both times i came back having forgotten most of the mechanics and had to basically reteach myself the Bellman update, epsilon greedy, all of it. Honestly that was one of the more humbling parts of this whole project, realizing how fast RL concepts slip out of your head if you dont use them for a bit. But each time i came back i could still explain my own design decisions, which told me the understanding was still in there somewhere, it just needed refreshing.

## Designing the agent

Each agent has traits like age, health, savings, risk tolerance, social support and a disease flag, all randomly generated within ranges. From these traits i compute a **threshold** value, a single normalized number roughly 0 to 1 that represents how resilient that agent currently is.

My first attempt at normalizing this threshold used a sigmoid function, since id read it was a common way to squash numbers into 0 to 1. Turns out that was a mistake. My raw threshold was always a small positive number, so i was only ever using the flattest, most squashed part of the sigmoid curve, meaning almost every agent ended up with a threshold between 0.6 and 0.97 regardless of how different their actual traits were. Switched to just dividing by the number of terms i was summing, a plain linear rescale, and suddenly the threshold values actually spread out properly based on real trait differences. Lesson learned there, dont reach for a fancy normalization function just because it sounds right, understand what shape of input it actually expects.

When a shock hits, i compare its intensity against the agents threshold to get an **impact** value. If the shock is below threshold, impact is basically 0, the agent absorbs it fine. If its above, impact scales with how much it exceeded threshold. This was actually the second real bug i hit, my first version of this comparison function returned the same number regardless of whether the shock was safe or not, because i only changed the print statement between the two branches and forgot to actually change the returned value too. Such a small thing but it completely broke the logic silently, no errors, just wrong behavior that looked fine at a glance.

## Actions and why Ignore is sneaky

Agents pick between three actions each cycle, Ignore, Reduce Consumption, and Seek Support. Each one reduces the impact differently depending on agent traits, Seek Support works better if the agent has high social support for example.

I made another mistake here that only showed up way later. When i split how impact affects health versus mood differently per action, i wrote explicit branches for Seek Support and Reduce Consumption but completely forgot to add a branch for Ignore. Since my code was if elif elif with no else, Ignore ended up applying literally no damage at all, health and mood would just climb from recovery every single cycle an agent chose it. This made Ignore look like a completely free, risk free action in my data, when it was supposed to be the opposite, doing nothing while a shock hits you should hurt more, not less. Took me a while looking at an output table full of agents happily sitting at full health to realize what was going on. Fixed it by just making sure every action, including Ignore, has an explicit branch that applies the full impact.

## Rewards, and the mystery of the negative numbers

Reward is just the change in health plus the change in mood, minus whatever that action cost to take. For a while every single reward i computed was negative or zero, and i genuinely thought something was broken. Turns out it wasnt a bug, my state update function only ever subtracted health and mood from impact, there was no code path that let them increase except for a small recovery amount per cycle. So reward being negative most of the time was just mathematically correct given how i wrote things, not an error. What i was actually missing was proper action costs being subtracted in the reward formula, i had defined them in a dictionary but forgot to ever use them. Good reminder that defining a constant somewhere doesnt mean youve wired it up.

## Recovery, and agents all converging to the same floor

Once the full loop was running across multiple cycles for one agent, i noticed something that looked wrong, basically every agent regardless of their traits would drop to a low health and mood value within a handful of cycles and just stay stuck there for the rest of the run. Didnt matter if they had great savings and social support or terrible ones, same floor every time.

The issue was my recovery amount per cycle, the bit that lets health and mood climb back up between shocks, was way too weak compared to how hard shocks were hitting. So every agent regardless of resilience just got ground down to the same bottom and stayed there, which completely defeated the point of the whole project since the entire thesis is that different traits should produce different outcomes. Bumped the recovery values up meaningfully and reran, and suddenly you could actually see agents with better traits stabilizing at healthier levels while others stayed low, which was honestly the first moment the simulation actually started looking like it was doing what i wanted it to do.

## Actually wiring up Q-learning

This part took the longest mentally, not because the math was hard, i already understood the Bellman update from FrozenLake, but because i kept conflating different responsibilities into one function. At one point i had a single function trying to both create a brand new random agent and run one shock cycle for it at the same time, meaning i could never actually run multiple cycles on the same individual, every call just gave me a fresh random stranger. Took some back and forth to properly separate "create the population once" from "run one step for an agent that already exists", which sounds obvious in hindsight but genuinely tripped me up for a bit.

State for each agent ended up being just their bucketed health and mood, 5 tiers each, giving 25 possible states. I deliberately left savings, social support and disease out of the state itself, since those are already baked into how effective each action is and what reward comes out, the agent doesnt need to separately observe them, it learns their effect indirectly through experience.

Once the actual Q-table update was wired in i hit one more silly bug, i referenced a reward variable in my update call before id actually calculated it a few lines below, which just throws an error immediately. Classic case of writing code in the order it made sense in my head rather than the order python actually needs to execute it in.

Epsilon decay had its own dumb bug too. I wrote `epsilon *= max(decay_rate, min_epsilon)`, which if you actually think about it is just comparing two fixed constants against each other every time, so epsilon kept shrinking forever with no floor at all instead of stopping at the minimum i wanted. Needed to wrap the whole computed result in the max, not just the two constants, so it clamps the actual decayed value instead of clamping nothing.

## Seeing it actually learn

After all those fixes, running a population of agents for a few hundred cycles each finally showed real, distinct trajectories. Some agents climbed and stabilized near full health, some stayed stuck oscillating low, some were volatile but kept bouncing back. Looking at one agents actual learned Q-table, the three actions had genuinely different values for a given state, not just noise, meaning it had actually learned which action tended to work out better for its specific situation. That was a pretty satisfying moment after a lot of small invisible bugs along the way.

## The dashboard

Once the core simulation was solid i put together a Streamlit dashboard to actually visualize whats going on instead of reading scrollback in a terminal, population wide health and mood trends over time, the mix of actions taken across the population, average reward, and a per agent breakdown including their live Q-table values. The Streamlit interface itself was built with AI assistance since it was purely a visualization layer on top of something already working, but the simulation underneath it, the Agent class, the whole Q-learning loop, the reward and threshold design, all of that is mine.

## What i actually learned from this

Technically, i learned what a Q-table actually represents beyond the textbook definition, i learned why normalization functions need to match the actual range of your input, i learned how easy it is to silently break logic by forgetting a single branch in an if elif chain, and i learned that "it runs without errors" means basically nothing about whether the logic is correct.

Less technically, i learned that stepping away from a project for a while isnt the end of it, i came back twice having forgotten most of the mechanics and both times i was able to rebuild understanding faster than the first time around, which i think says something about how learning actually sticks even when it doesnt feel like it in the moment. Also learned to trust output over assumptions, more than once i was convinced something was broken when the numbers were actually just telling me my own design had a flaw i hadnt noticed yet.
