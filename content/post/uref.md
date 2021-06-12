+++
title = "Scott Meyers' Universal References"
date = "2021-05-27"
# author = "Lorem Ipsum"
# cover = "hello.jpg"
description = "Notes on the use of T&& parameters in C++."
tags = ["c++"]
# toc = true
+++

I came across an another very clarifying talk of the legend Scott Meyers presenting 
[Universal References in C++11](https://channel9.msdn.com/Shows/Going+Deep/Cpp-and-Beyond-2012-Scott-Meyers-Universal-References-in-Cpp11) back in 2012. In this talk 
he calls our attention to the misleading usage of template parameters `T&&`, which we usually
assume being _rvalue_ references in all situations. It happens that it is not always the case.

The fact is that `T&&` becomes a _rvalue_ reference or a _lvalue_ reference depending on the 
case. Meyers defines a **universal reference** as a variable or parameter that fulfills the
following requirements
1. It is declared as `T&&`;
2. `T` is a deduced type;

If a universal reference is initialized with a _lvalue_, then it becomes a _lvalue_ reference. 
If a universal reference is initialized with a _rvalue_, then it becomes a _rvalue_ reference.

Let's consider a template function `f`
```cpp
template<typename T>
void f(T&& param);
```
and an instance of some arbitrary class
```cpp
SomeClass c;
```
Then `T&&` will be interpreted by the compiler differently depending on the usage of `f`:
```cpp
f(c);               // instantiated as f(SomeClass&);
f(std::move(c));    // instantiated as f(SomeClass&&);
f(SomeClass());     // instantiated as f(SomeClass&&);
```
As you may notice, we get an _lvalue_ reference in the first case. 

> `const T&&` is not a universal reference.

The same logic is 
applied to the use of `auto` declarations:
```cpp
auto&& v = 10;      // type is int&&

std::vector<int> v;
auto&& e = v[5];    // type is int&
```
> Attention: In the case of a template class (such as `std::vector<T>`) with method parameters 
using its templates (such as `std::vector<T>::push_back(const T&)` and `std::vector<T>::push_back(T&&)`), 
the type is resolved 
at class instantiation and therefore there is no universal reference -- there is no type 
deduction. `std::vector<T>::emplace_back<...Args>(Args&&...)` on the other hand gets ``Args`` resolved
by deduction, therefore a universal reference.

The importance of distinguishing between _lvalue_ and _rvalue_ instantiations along with 
template references gets more clear when we do things like move constructors or
function overloads:
```cpp
class MyClass {
    template<typename T>
    void doStuff(const T& param);   // takes const lvalues only
    template<typename T>
    void doStuff(T&& param);        // takes everything else!
};
```
If we don't pay attention, the code might actually run one function instead of the function 
we might be mistakenly be expecting it to. Take some time to think about it: non-const 
_lvalue_ are sent to the second function, and not the first.

### Rules of Thumb
Speaking of _lvalues_ and _rvalues_, here are some tips to keep in mind:
```cpp
void f(const SomeClass& param) {
    // Use param normally
}
void f(SomeClass&& param) {
    // Access param with std::move(param)
    // Although SomeCLass&& is a rvalue reference type, param is a named variable,
    // therefore a lvalue, leading to copy operations. So we must make sure to work 
    // with param as its original rvalue semantic
}
template<typename T>
void f(T&& param) {
    // Access param with std::forward<T>(param)
    // Since param can virtually be anything we want to keep its original 
    // lvalue/rvalue semantic
}
```

### Under the hood
For the curious out there, this _transformation_ between _rvalue_ references to _lvalue_ references 
caused by universal references happens because the way the compiler deduces reference types. For 
example,
```cpp
template<typename T>
void f(T&& param);

SomeClass c;
f(c);
```
`f` will be instantiated with its template parameter `T` deduced as `SomeClass&`:
```cpp
void f<SomeClass&>(SomeClass& && param);
```
However, reference of reference is not allowed, so the compiler resolves it by collapsing references
following the rules
```cpp
T& &        // collapses to T&
T&& &       // collapses to T&
T& &&       // collapses to T&
T&& &&      // collapses to T&&
```
Then the final version for our function becomes
```cpp
void f<SomeClass&>(SomeCLass& param);
```
`auto` follows the exact same rules.