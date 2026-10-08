---
title: "C++ Thread Pool"
date: "30-09-2026"
description: "A templated C++ thread pool with move semantics, futures/promises, and a custom type-erased task wrapper"
---

## Introduction

So, the main idea behind this thread pool is the concept of Producer - Consumer Pattern. Producer (creates a task and give it to the queue) - this is the submit function,
It submits tasks to the queue. Consumer (Threads wait around the tasks to take a work) - this is payload function, It takes each task and and execute it. Now the payload
function has threads and they can compete to take a task and also `std::queue` is stupid - if two threads try to take a task it will rip the queue's internal pointers and
crash the program - this is called _Data Race_. To prevent _Data Race_, we have `std::mutex` - it creates sort of a line for threads. `std::unique_lock` locks the mutex that
was created. The lock lets only one thread at a time to take a task. Now lets say that there is no task in the queue - If we run a loop to check if there is a task in the queue
or not, it is VERY cpu heavy and will max out cpu 100%. If there are no tasks, the thread unlocks, loops around, locks the mutex again, checks again, unlocks, loops around...
it does this millions of times a second. This is called _busy waiting_. `std::condition_variable` solves this issue. It allows threads to sleep if there are no tasks until
a task arrives. `cv.wait()`, it checks if the queue is not empty or if the pool is not stopping, then it do that task. if its not - then it unlocks the mutex, and thread goes
to sleep. In the submit function, when a task is added to the queue, it notifies a thread about it.

One thing i had to be careful about in the shutdown logic: the destructor has to call `notify_all()`, not `notify_one()`. If you only wake one sleeping thread, the rest stay
asleep forever since nobody is going to submit new work during shutdown to wake them up naturally. Took me actually crashing/hanging the program to really get why this matters.

Also - any task that throws an exception has to be wrapped in try/catch inside the worker's loop, otherwise an unhandled exception escaping a thread's entry function calls
`std::terminate()` and kills the entire program, not just that one task. Found this out by literally watching Visual Studio pop up a "Debug Error - abort() has been called"
dialog the first time I tested it. One bad task should only cost you that one task.

Apparently template functions have to be implemented in header files and not in cpp files. I found this out the hard way - spent a long time confused by a wall of linker
errors before realizing templates need to be fully visible wherever they're used, because the compiler only generates real code for a template once it sees an actual call
site with concrete types. If the definition's hidden in a .cpp file, other files calling it never see enough to instantiate from.

I have never worked this long on a function before. submit function is a vardiac template function. Vardiac templates are templates but you can pass any type of callable as
in any type of function or lambda and also these functions can have zero or more parameters. a normal template just has one type of data that can be passed. In the fucntion,
`void submit(F&& f, Args&&... args) {..}` the F tells compiler that "This is a void function that taskes two int and one string as param". the small f is like the callable, when u
wanna execute that function in F, u call the lowercase f. the Args... just packs the type of params passed as a list and the lowercase is the actual param value itself. "..." this
is just saying zero or more params in this case.

The thing that made variadic templates click for me was realizing the capital-vs-lowercase distinction: `F`/`Args` are compile-time type placeholders (never touched as
values), `f`/`args` are the actual runtime values. Once I stopped mixing those up in my head, the rest of the syntax stopped feeling so arbitrary.

Next thing to understand is Permanent values(Lvalue) - things that has a name and permanent address in memory & Temporary values(Rvalue) - short lived values with no name(has no address).
`int name = 25;` in this name is an Lvalue and 25 is an Rvalue.

On forwarding references specifically - `F&& f` inside a template isn't automatically an rvalue reference the way `&&` normally is. Because it's a template parameter combined
with `&&`, it's a "forwarding reference" (aka universal reference) that can bind to either an lvalue or rvalue depending on what the caller actually passes. This is why you
use `std::forward<F>(f)` instead of `std::move(f)` - `std::move` unconditionally treats something as an rvalue no matter what it actually was, which could forcibly move out
of something the caller still wanted to use. `std::forward` preserves whatever the original value category actually was. I had this backwards at first and was using
`std::move` on `f` even in the forwarding version - small bug, but a meaningful one to understand, not just fix.

Now moving onto packaged_task - it basically packs the function so it can be moved, std::future gets the result of that function from packaged task. `std::packaged_task<F(Args...)>` Here F is
return type and Args... pack all the arguments into one pack(like i talked about earlier). `std::future` just uses `get_future()` to get the future of the packaged task.

The part that actually confused me for a long time: `packaged_task`'s angle brackets take a _function type signature_ - a description of shape, like `int()`, meaning "a job
that takes nothing and gives back an int." It is NOT the same as actually calling the function (`f(args...)`). I kept trying to write `packaged_task<f(args...)>` which doesn't
mean anything to the compiler - that's an action, not a type. Once I separated "describing a shape" from "running a thing," this made a lot more sense.

Also had to use `std::invoke_result_t<F, Args...>` to actually figure out what type to put in that signature, since I don't know in advance what any given submitted callable
returns - it answers "if I called this with these argument types, what would come back."

`std::function<void()> func = [f = std::forward<F>(f), ...args = std::forward<Args>(args)]() mutable{
			pTask();
};` This is type erased wrapper (std::function). What it does is it doesnt really matter what type of fucntion is being passed on, it packs everything into a void() function so different callers
can call any type of function. In the lambda function, we define f and args again because during runtime, submit function gets run very quickly and lambda is run a bit later, so f and args go out of
scope and also [] acts as a sort of wall between the submit function and the lambda. So both of this reason combined we have to define them again to use. `std::forward` helps to increase performance.
It lets you move items rather than copying. Copying the items is memory intensive and `std::forward` just helps with that.

The capture syntax `[f = std::forward<F>(f), ...args = std::forward<Args>(args)]` is called an "init-capture" combined with pack expansion - you're creating brand new
variables that live _inside_ the lambda, each initialized by forwarding the outer parameter. The `...` has to appear in two separate places when you're dealing with a pack:
once in the capture list (`...args = ...`) and once again wherever you actually call it (`f(args...)`) - each is a separate expansion and I kept forgetting the capture-side one.

Also needed `mutable` on these lambdas, since a lambda's captured variables are `const` by default inside its body, and invoking the stored callable can require a non-const
call depending on what's captured.

std::move is just handing over owenership of pTask to task so it can be called. this is so that we avoid calling pTask instantly

So we removed the std::move because packages_task is move only and std::function has to be copyable. so to get around it, we use shared_ptr which is something that is copyable
and we pass that to std::function. Now share_ptr just points to the memory location of the packaged)\_task so this lets us copy the pointer how many times as we want. so for this we
wrap our packaged_task in `std::make_shared<>` and have the whole packaged_task in variable called sharePtr. now i can to call the packaged_task i can just refer to the location with
(*sharedPtr) and to call future on it, i can either sharedPtr->get_future() or (*sharedPtr).get)\_future()

The actual compiler error that forced this fix was a `static_assert` buried inside `<functional>`: "The target function object type must be copy constructible." That's
`std::function` enforcing its copyability requirement at compile time rather than letting it fail silently at runtime - a genuinely nice safety net once I understood what
it was telling me, instead of just being scared of a wall of template error text.

Worth noting the real cost of the shared_ptr version, which is exactly why I later replaced it: every `submit()` call does a heap allocation (`make_shared`), and every time
the shared_ptr gets copied or destroyed there's an atomic increment/decrement of its reference count. Atomics are thread-safe but not free - for a pool meant to dispatch lots
of small fast tasks, that per-task cost adds up. Totally legitimate technique, real production code uses it, but not the minimal-overhead version I wanted to end up with.

We create a TaskBase and TaskImpl class. this is so that we create our own type erase move only task wrapper instead of `std::function<void()>`.
this is like Taskbase is the abstract class, we set virtual functions so that when you call this function through a base class pointer, actually run the derived class's version,
not the base class's version. to set a virtual function, we need to set virtual and make it execute() = 0
now we create a template class thats inheriting the TaskBase. now we can either do struct TaskImpl : TaskBase or classs TaskImpl : public TaskBase. now we add the implementation of the
execute function by overriding it so the compiler knows that we are overriding the abstract class function here. we also just have the class implementation at first. Also we dont need
a destructor for the TaskImpl function because the compiler will automatically destroy it. Only time we would need a destructor is when we need to manage resource like a new pointer
or something but here we dont need it.

One correction to how I originally explained struct vs class here: it's not that struct "demands" public inheritance and that's uniquely why it works - it's that `class`
defaults to _private_ inheritance if you don't say otherwise, and `struct` defaults to _public_. Writing `class TaskImpl : public TaskBase` (explicit `public`) works exactly
the same as `struct TaskImpl : TaskBase` - the explicit `public` keyword is what's actually doing the work either way, not the struct/class choice itself.

Also worth being precise about what `virtual` actually does, since I conflated this with accessibility at first: `virtual` has nothing to do with public/private access. It
means "when this function is called through a base class pointer, actually run whatever the real derived object's version is" - without it, calling through a `TaskBase*`
would only ever see TaskBase's own version (or fail to compile, since TaskBase's version doesn't exist here).

And the destructor DOES need to be virtual on TaskBase itself (not TaskImpl) - if it isn't, deleting a `TaskImpl` object through a `TaskBase*` only runs TaskBase's destructor,
never reaching TaskImpl's actual members for cleanup. Real undefined behavior, not just a style nitpick.

we store TaskImpl<some type> which holds a lambda or function pointer with make_unique and we set it to a pointer on the heap is stored as unique_ptr<TaskBase> and then we can just call
and execute it with ptr->execute() idk if that make sense. i still dont understand the why behind, why called ptr->execute().

//

Now, why we do it is because when we need to call TaskImpl with different types string, int, function pointer it doesn't matter, a std::queue cannot hold different types together
when we pass a whole bunch of work. meaning we take a bunch of work with different types and we pass it to the queue, the queue wont be able to know what type to hold or actually
cant hold. But then each of those tasks will have one thing in common which the base class TaskBase. so we make it in a way that our queue holds unique_ptr<TaskBase> it can hold
pointers to any type of TaskImpl<F> instantiations. And when we call ptr->execute(), the virtual functions is overridden by whatever TaskImpl<F>::execute()
so the type will know at that time.

I eventually did land the "why" here properly - in my first isolated test, calling execute() through a base pointer felt pointless since I could've just called it directly
on the concrete object. The actual payoff only shows up once you need ONE container to hold MANY different concrete types at once. Every lambda has its own unique,
compiler-generated type, so `TaskImpl<LambdaA>` and `TaskImpl<LambdaB>` are genuinely different C++ types - a queue can't hold a mix of them directly. But they all share
one base, `TaskBase`, so a queue of `unique_ptr<TaskBase>` can hold any of them, and virtual dispatch finds the right `execute()` automatically at runtime, without the
calling code (the worker loop) ever needing to know what concrete type it's actually holding.

Now another issue comes with this. when we call assign the `std::unique_ptr<TaskBase> ptr = std::make_unique<TaskImpl<LambdaType>>(lambda1);` we have no idea what type to pass to
TaskImpl. we cant pass a function pointer always, it only works if the lambda has no capture list(a capture less lambda is allowed by C++ to be converted into a function pointer).
so we would need a way to automatically deduce the type of F without hardcoding. And for that we use CTAD or so i thought.

this is how u do user defined deduction guide btw `template <typename F> TaskImpl(F) -> TaskImpl<F>;` this is pretty self explanatory, just make sure its in the header file
after class defintions and everything

CTAD is used if im calling the TaskImpl directly. but here we are calling it with `make_unique` - it has no idea what the deduction guide is or antyhing.
so what we do is we get the type at compile time and pass the tytpe to the TaskImpl template argument.
it looks something like this
`auto lambda1 = []() { std::cout << "This is inside lambda type\n"; };
using LambdaType = decltype(lambda1);`
so now we can pass LambdaType to the TaskImpl template argument and pass the lambda1 to the TaskImpl clas argument if that make sense
`std::make_unique<TaskImpl<LambdaType>>(lambda1);` this is what i mean. Now this was all test and to learn, we now see what we can do in our thread-pool file.

we already have the type through out vardiac template which we can directly pass as LambdaType and lambda1 can also be taken from the template and it should work as intended.

Turns out `decltype` isn't even something I need to reach for separately inside the real `submit()` - since submit is already a template function, the type of the
packaged_task-wrapping lambda just gets deduced naturally wherever I build it inline, no named intermediate variable needed. The decltype step was only necessary in the
standalone scratch test because I was naming things explicitly there for learning purposes.

`auto sharedPtr = std::make_shared<std::packaged_task<ReturnType()>>(
			[f = std::forward<F>(f), ...args = std::forward<Args>(args)]() mutable {
			return std::invoke(f, args...); // std::invoke lets u call any type of function but how it is called is handled at compile time and we dont have to worry about it.
		});
`
`std::function<void()> func = [sharedPtr]() mutable {
			(*sharedPtr)(); //this is a pointer to the packagad task.
		};
`

## Replacing shared_ptr with TaskBase/TaskImpl (final submit() shape)

Once the scratch TaskBase/TaskImpl test worked, wiring it into the real `submit()` turned out to not need a new wrapping lambda at all for this part. The `packaged_task`
itself is already callable (`pTask()` runs it directly), so it qualifies as a valid `F` for `TaskImpl` on its own - no extra lambda layer needed around it. The actual shape
ended up being: build the packaged_task (plain local object now, no shared_ptr), pull `.get_future()` off it immediately, then construct a `TaskImpl<std::packaged_task<ReturnType()>>`
via `make_unique`, moving the packaged_task in (since it's move-only). That `unique_ptr<TaskImpl<...>>` implicitly converts to `unique_ptr<TaskBase>` when pushed into the
queue, since `TaskImpl` publicly inherits from `TaskBase` - same mechanic proven in the scratch test, just applied for real.

In `payload()`, popping off the queue had to change from a copy (`auto task = queue.front();`) to a move (`auto task = std::move(queue.front());`), since `unique_ptr` can't
be copied - the compiler just refuses to compile the copy version, which forces the fix rather than letting it fail quietly. And calling the task changed from `task();` to
`task->execute();`, since `task` is now a pointer to an object with an `execute()` method rather than a directly-callable `std::function`.

A few real bugs I hit putting this together, worth remembering: using `->` instead of `.` on a plain (non-pointer) packaged_task object, a dropped `return` inside the
wrapping lambda's body (meaning the packaged_task had nothing to actually capture into its promise, so `.get()` would've come back empty even for tasks that should return
real values), a mismatched parenthesis on the `make_unique` line, and forgetting to `std::move` the `unique_ptr` when pushing it into the queue (same copy-vs-move issue as
everywhere else in this project, just at a different line).

## Validation

Didn't set up a formal test framework given time constraints, but ran a deliberate manual pass covering: return values and exceptions round-tripping correctly through
`std::future`, 5,000 concurrently submitted tasks against a mutex-guarded counter (submitted count exactly matched completed count, repeated across multiple runs - a
mismatch here would've meant a real race condition in the queue), a task capturing a `std::unique_ptr` in its closure (the actual scenario Phase 5 existed to support),
and confirming the destructor waits for pending/in-flight tasks to finish before the pool actually tears down.

Learned partway through that ThreadSanitizer (`-fsanitize=thread`) isn't well-supported on MSVC/Windows - it's primarily a Clang/GCC, Linux-first tool - so a true TSan pass
would need a WSL or Linux toolchain, which I noted as a next step rather than rushing under time pressure.

## What's left

Python bindings via pybind11 are the planned next step, not done in the initial version. The real design snag there: `submit()` is a template, and templates don't have a
Python-facing equivalent - Python has no concept of "accept any callable with any signature" the way C++ templates express it. The realistic approach is exposing a `submit`
that accepts a `py::function` specifically (any Python callable, dispatched onto a C++ worker thread), handling the GIL explicitly - releasing it around the C++-side
dispatch/wait, and reacquiring it when a worker thread actually calls back into the Python callable. Worth being upfront that this doesn't give real parallelism for
CPU-bound pure-Python work either way, since the GIL still serializes actual Python bytecode execution - the concurrency benefit there is really for I/O-bound callables
or genuine C++-side computation.
