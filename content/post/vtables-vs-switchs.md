+++
title = "vtables vs switches"
date = "2021-09-07"
# author = "Lorem Ipsum"
# cover = "/img/posts/pbrt-cuda/render.png"
description = "Polymorphism or function pointers?! A simple macro trick in the end :)"
tags = ["c++"]
# toc = true
draft = false
+++

Imagine this: you have a super class `Letter` and the _whole alphabet_ of classes -- `A`, ..., `Z` -- that inherits from it. 
All children implement a method of `Letter` called `spell` that returns a `char` with the ascii of its respective letter.
So, for instance,  class `A::spell()` returns `'a'`.

Now you have an array with thousands of thousands of `Letter` children and you want to call `spell` for each of them -- the classic
usage of polymorphism.

What runs faster? Use polymorphism as usual or cast each array element to the correct alphabet letter?

## The cost of inheritance
Objects of classes with no virtual methods have no overheads in memory. There is no additional data to store for them, they just
work exactly the same as structs in `C`. Not even the functions of these classes occupy any per-object memory space.

Objects of polymorphic classes on the other hand do have overheads in memory space. Each object containing virtual functions
will at least store an additional pointer. The object's class in turn will also store additional data: a _virtual function table_,
know as the **vtable**, and other information such as _run-time type information_ (RTTI).

When we call a child class' virtual function, the code does not have the pointer to the correct function in hands,
it needs to look at the vtable first and then call the correct function. There is a indirection there, you see.

## So what?

Nowadays compilers are very well capable of optimizing the vtable access and I hardly believe virtual methods will
actually be a performance issue for you. Also, the alternatives generally come with some sort of overheads as well:
- You may need to store the type of you child class in the object.
- You may need to cast correctly the pointer depending on the type of the object.

... and many other consequences of many crazy solutions you may come up with. So, does it worth the trouble?
Well let's see.

The code bellow is the polymorphic solution to our _alphabetic_ problem:
```cpp
class Letter {
    public:
        virtual char spell() = 0;
};

class A : public Letter {
    public:
        char spell() override {return 'a';}
};

...

class Z : public Letter {
    public:
        char spell() override {return 'z';}
};

int main() {
    std::vector<Letter*> letters;
    int n = 10000000;
    for(int i = 0; i < n; ++i)
        switch(std::rand() % 26) {
            case 0: letters.push_back(new A()); break;
            ...
        }
    
    auto start = std::chrono::high_resolution_clock::now();
    for(int i = 0; i < n; ++i)
        letters[i]->spell();
    auto end = std::chrono::high_resolution_clock::now();

    ...
}
```

And here is one possible alternative that avoids vtables:
```cpp
enum class LetterType {A, B, ... , Y, Z };

class Letter {
    public:
        void* ptr{nullptr};
        LetterType type{LetterType::A};
};

class A {
    public:
        char spell() {return 'a';}
};

...

class Z {
    public:
        char spell() {return 'z';}
};

int main() {
    std::srand(std::time(nullptr));
    int n = 10000000;
    std::vector<Letter> letters(n);
    for(int i = 0; i < n; ++i)
        switch(std::rand() % 26) {
            case 0: letters[i].type = LetterType::A; 
                    letters[i].ptr = new A();   
                    break;
            ...
        }

    auto start = std::chrono::high_resolution_clock::now();
    for(int i = 0; i < n; ++i) 
        switch(letters[i].type) {
                case LetterType::A : ((A*)letters[i].ptr)->spell(); break;
                ...
        }
    auto end = std::chrono::high_resolution_clock::now();

    ...
}
```

As you can see, the alternative solution I used here was to simply remove inheritance and store 
the type of each object and its pointer into the _base_ class object. Now I have to check
with a `switch` each array element and cast the pointer to the correct type before calling 
the `spell` function.

I run a bunch of times each program above and I got the following times (`start` - `end` in each code) in average:

| Solution     | time (ms) |
|--------------|--------|
| Polymorphism | 147  |
| Switch       | 55   |

Well there is a difference there, switches turned out to be almost 3x faster than virtual functions. 
However, that can't be taken as a conclusion or truth, I did it for curiosity! 

Each program is particular on its own and different compilers will optimize your code in different manners.
In the end of the day this kind of design will be good or bad to you, since it depends on lots of things, 
that is hard to come up with a rule of thumb here. 

>Each solution has its pros and cons. You need to understand the distribution and size of you data, access patterns and much more in order to balance your design with the efficiency of you code. It is hard indeed, software is complex! Nevertheless, question your code from time to time is a good habit :)

## Bonus
The switch solution can quickly become very verbose and tedious to code, and the situation gets
worse if you have multi-levels of these type of classes. A simple way to 
make things a little better is to use macros. 

You can create a macro to cast the pointer to you and provide you a pointer of the correct type
so you can use as you like. For example, in our _alphabet_ case:

```cpp
#define CAST_LETTER(LETTER, PTR, CODE) \
{                              \
  switch(LETTER.type) { \
    case LetterType::A : { auto* PTR = (A*)LETTER.ptr; CODE break; } \
    ...
    case LetterType::Z : { auto* PTR = (Z*)LETTER.ptr; CODE break; } \
  }\
}
```

The for ends up like this:
```cpp 
for(int i = 0; i < n; ++i)
  CAST_LETTER(letters[i], ptr, {
      output += ptr->spell();
      });
```


