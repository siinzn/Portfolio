---
title: "WindowsX64Debugger in C++"
date: "01-06-2026"
description: "User-mode debugger for x64 Windows processes"
---

## Introduction

WindowsX64Debugger is a user-mode debugger for x64 Windows processes built using the Windows Debugging API and C++. The project focuses on understanding how debuggers work internally, including debug event handling, process attachment, software breakpoints and memory modification. The project was developed as a systems programming exercise to gain practical experience with Windows internals and low-level process debugging.

## Project Explanation

The main function takes 2 command line arguments. one is the application path and the other is the address of the process.

`ZeroMemory()` takes a variable like in this case sInfo or pInfo which is startup information or process information and then it sets all bytes to zero. This gives us a clean slate to work with. Structs like sInfo has other fields which CreateProcess doesn't really need.

`CreateProcessA` is a function that comes from Windows API. I can pass in the application path with this function and open the desired program. `CreateProcessA(applicationName, NULL, NULL, NULL, FALSE, DEBUG_PROCESS, NULL, NULL, &si, &pi)`
The other parameters in this is pretty negligible as u can pass NULL (for this project, there might be uses for it for other projects). For creation flag we pass `DEBUG_ONLY_THIS_PROCESS`. This is so that we only debug the process we created and no child process. We also pass a reference to StartupInfo and ProcessInformation that was clean slated earlier.

Then we have the main loop where everything takes place. We start off by checking if `WaitForDebugEvent` returns false -> if false break. `WaitForDebugEvent` has two params, one is a debugEvent struct which has details about the events which will be used later on and INFINITE - this just runs the function until a debuggging event has occured.

We run a switch statement(faster than if statements that was new, also in this project's scope thats better because we check one variable against many constant values). We care about `debugevent.dwDebugEventCode` this is what tells us whats going on with the debugging.
Case - `CREATE_PROCESS_DEBUG_EVENT` - When this debug event happens we install the breakpoint at the address given by the user.

`installBreakPoint` is pretty straightforward. Essentially what it does is read the single byte currently at the target address using `ReadProcessMemory` and store it in `originalByte`.This is the byte we'll need to restore later. Then, since code pages aren't writable by default, `VirtualProtectEx` temporarily changes the page protection to `PAGE_EXECUTE_READWRITE`. With write access granted, `WriteProcessMemory` writes `0xCC` (the `INT3` instruction) into that address. `VirtualProtectEx` is called again to restore the original protection. `FlushInstructionCache` is called because the CPU caches decoded instructions, and without flushing it might execute a cached version of the original instruction instead of seeing our `0xCC`.

Case - `EXCEPTION_DEBUG_EVENT` - This is where most of the main logic happens. When this event is fired, we check `debugEvent.u.Exception.ExceptionRecord.ExceptionCode` to figure out what kind of exception occurred. If the code is `EXCEPTION_BREAKPOINT`, we need to first check if `ExceptionAddress` matches our `baseAddress`. This is important because the first `EXCEPTION_BREAKPOINT` a debugged process generates is the system's initial breakpoint at process startup, not ours. So we ignore anything that isn't at our address.

If it is our breakpoint, we call `GetThreadContext` to read the current CPU register state into our `context` struct, then print all the registers with `printRegisters`. At this point `context.Rip` points to one byte _past_ our `0xCC`, because the CPU advances `RIP` after executing the `INT3` instruction. We subtract 1 from `Rip` so it points back at the original instruction. We also set bit 8 of `EFlags` (`0x100`). This is the trap flag, which tells the CPU to execute exactly one instruction and then raise an `EXCEPTION_SINGLE_STEP` exception. Then we restore the original byte with `WriteProcessMemory` and call `SetThreadContext` to apply our modified register state back to the thread.

If the code is `EXCEPTION_SINGLE_STEP`, this means the trap flag we set earlier just fired after the original instruction executed. We call `installBreakPoint` again to re-patch `0xCC` at the address. This is what makes the breakpoint persistent, it keeps firing every time execution reaches that address, rather than just once.

Case - `EXIT_PROCESS_DEBUG_EVENT` - We set `running = FALSE` so the main loop terminates after this iteration. Every iteration ends with `ContinueDebugEvent(debugEvent.dwProcessId, debugEvent.dwThreadId, DBG_CONTINUE)`. This tells the kernel we've handled the event and the debuggee's threads can resume.

## Learning outcomes

This project was a significant jump from Windows Monitor in terms of what "level" I was operating at. Windows Monitor read system information like process lists, memory stats, CPU times. This project directly manipulates the execution state of another running process: patching its instructions in memory and rewriting its CPU registers mid-execution.

Concepts I had to learn from scratch:

- The Windows debug event loop (`WaitForDebugEvent` / `ContinueDebugEvent`) and the debugger/debuggee relationship. The kernel acts as a middleman that suspends the debuggee and hands events to the debugger
- How software breakpoints work mechanically: patching `0xCC` (`INT3`) into memory, and why this requires `VirtualProtectEx` and `FlushInstructionCache`
- The `CONTEXT` structure and how to read/modify CPU registers on x64 via `GetThreadContext` / `SetThreadContext`
- Why `RIP` needs to be decremented after a breakpoint fires — the CPU advances past the `0xCC` before the exception is delivered
- The trap flag (bit 8 of `EFLAGS`) and how single-stepping is used to make breakpoints persistent

## Drawbacks & How I overcame them

The biggest non-conceptual obstacle was a Windows environment issue: `CreateProcess` with `DEBUG_ONLY_THIS_PROCESS` kept failing with error 50 (`ERROR_NOT_SUPPORTED`) when run from a normal terminal, despite running as administrator and disabling Defender. The fix turned out to be that my project was building as x86 by default through Visual Studio's F5, while my manual CMake build was x64 — a 32-bit debugger cannot debug a 64-bit process. Forcing the x64-debug/release configuration explicitly resolved it.

Another challenge was dealing with ASLR — the address of any instruction in the target changes on every run, so I had to get the address fresh from x64dbg each time I tested. For a real debugger this would be solved with symbol resolution and relative offsets, but for this project's scope, manually grabbing the address per run was an acceptable tradeoff.

## What I would have done differently

I'd plan the address-resolution workflow earlier — relying on ASLR-affected hardcoded addresses made testing slower than it needed to be. I'd also attempt `DebugActiveProcess` (attaching by PID to an already-running process) more thoroughly; it worked fine on Notepad but failed on my own target due to privilege mismatches I didn't fully resolve. If I extended this project I'd want to fix that properly rather than working around it with `CreateProcess`.

### References

- https://learn.microsoft.com/en-us/windows/win32/api/debugapi/nf-debugapi-waitfordebugevent
- https://learn.microsoft.com/en-us/windows/win32/api/debugapi/nf-debugapi-continuedebugevent
- https://learn.microsoft.com/en-us/windows/win32/api/minwinbase/ns-minwinbase-debug_event
- https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessa
- https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-getthreadcontext
- https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-setthreadcontext
- https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-context
- https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-virtualprotectex
- https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-flushinstructioncache
