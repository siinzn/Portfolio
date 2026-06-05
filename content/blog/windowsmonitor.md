---
title: "Windows Monitor in C++"
date: "20-03-2026"
description: "Getting Familiar with windows apis"
---

## Introduction

Windows Monitor is a system monitoring tool similar to Task Manager, built using Windows Native APIs (Win32).The project focuses on learning Windows internals, process management, and system resource monitoring using C++.

The Monitor can:

- Display system CPU usage
- Display System Memory usage
- Per-process memory usage
- Display top running processes in real time

---

## Learning outcomes

Before starting this project, I barely knew anything about Windows APIs.  
I did not even know Windows exposed APIs that allowed applications to retrieve low-level system information like process times, memory statistics, and CPU usage.

One of the first things I encountered was unfamiliar C++ and Windows-specific data types such as:

- `FILETIME`
- `HANDLE`
- `DWORD`
- `uint64_t`
- `ULARGE_INTEGER`

Once I actually started calling Windows APIs and reading the documentation properly, things slowly started making more sense. Microsoft’s documentation was surprisingly helpful throughout the project and became one of my main learning resources.

One of the most important concepts I learned was the difference between **User Mode** and **Kernel Mode**.

- User Mode is where regular applications run. It limits what applications can access so that a crashing application does not crash the entire operating system.
- Kernel Mode has full access to hardware and system memory. This is where the operating system itself and low-level drivers operate.

Another major topic I became familiar with was the difference between **processes** and **threads**.

A process can be thought of as a container that stores resources for an application, including its own virtual memory space. Threads are the actual units that execute instructions inside a process. A single process can contain multiple threads running concurrently.

I also learned about concepts such as:

- Virtual memory
- Working sets
- CPU time deltas
- Process enumeration
- Handle management
- Real-time sampling

---

## Drawbacks & How I overcame them

Most of the difficulties during this project came from a lack of familiarity with both C++ and the Windows API ecosystem.

Even though the project started as a systems programming project, I quickly realized that many of the problems I was facing were actually software design and C++ problems rather than Windows API problems.

One challenge was understanding how CPU usage is actually calculated. At first, I assumed Windows directly exposed CPU percentages, but instead I had to learn how to calculate usage manually using time deltas from APIs like `GetSystemTimes` and `GetProcessTimes`.

Another challenge was understanding Windows-specific structures and types such as:

- `FILETIME`
- `PROCESS_MEMORY_COUNTERS`
- `ULARGE_INTEGER`
- `HANDLE`

Initially these looked intimidating, especially because many APIs required pointers, structures, and manual conversions between data formats.

Another major challenge was managing state across updates.  
Since CPU usage is calculated using deltas between samples, I had to store previous process data and compare it with newer snapshots. This forced me to become more comfortable with C++ containers like `std::vector` and `std::map`.

One concept I struggled with for a while was using custom keys inside maps.  
To correctly track processes over time, I learned that using only a PID was not reliable because Windows can reuse process IDs. I eventually solved this by creating a custom process key using both the process ID and process creation time.

I also became much more comfortable with:

- Iterators
- References (`const auto&`)
- Range-based loops
- Stateful update loops
- Structuring code into modules
- Separating update logic from rendering logic

As the project became larger, architecture became another challenge.  
The early versions had most of the logic inside `main.cpp`, which quickly became difficult to maintain. Refactoring the project into separate CPU, memory, process, and monitor modules taught me a lot about code organization and state ownership.

One particularly tricky part was storing previous process CPU times in order to calculate real-time CPU usage correctly between updates. This required maintaining state between iterations, handling processes that appeared or disappeared while the monitor was running, and cleaning old process entries safely without breaking iteration logic.

This was also my first time working with concepts like:

- Iterator invalidation
- Map erase patterns
- Stateful update systems
- Separating data collection from rendering
- Real-time process tracking

Another thing I struggled with was balancing learning with implementation speed.  
There were many moments where I understood the theory at a high level but did not yet know how to translate it into code. A lot of the learning process became:

1. Reading documentation
2. Trying implementation
3. Failing
4. Understanding why it failed
5. Refactoring later

## What I would have done differently

If I restarted this project, I would spend more time planning the architecture before writing code.

I would also likely store render data differently if I rewrote the project.  
For example, some values were converted into strings too early instead of remaining numeric until rendering time. While this worked fine for the project, it made things like sorting slightly less clean internally.

Another thing I would improve is the rendering layer. Right now the monitor uses a console-based interface, but in the future I would like to experiment with a proper GUI version using either Win32, ImGui, or Qt.

### References

- https://medium.com/@Usta0x001/deep-dive-into-windows-architecture-88f429e8843e
- https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-getsystemtimes
- https://learn.microsoft.com/en-us/windows/win32/api/sysinfoapi/nf-sysinfoapi-globalmemorystatusex
- https://learn.microsoft.com/en-us/windows/win32/api/tlhelp32/nf-tlhelp32-createtoolhelp32snapshot
- https://learn.microsoft.com/en-us/windows/win32/api/tlhelp32/nf-tlhelp32-process32first
- https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-openprocess
- https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-getprocesstimes
- https://learn.microsoft.com/en-us/windows/win32/api/psapi/ns-psapi-process_memory_counters
- https://medium.com/@Usta0x001/deep-dive-into-windows-architecture-88f429e8843e
