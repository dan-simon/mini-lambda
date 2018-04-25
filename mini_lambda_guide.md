## A Guide to Mini-Lambda

#### Introduction

This guide aims to explain the small functional programming language Mini-Lambda so that the reader can read and write code in the language and understand some of its theoretical underpinnings. Mini-Lambda is not meant for practical use.

#### Basic Information

Mini-Lambda is the typed lambda calculus with a few additions. These additions, while they are helpful, are not strong enough to make it Turing complete.

Mini-Lambda uses strict evaluation, not lazy evaluation. Thus, for example, even if a function is constant, its argument (if it has one) will still be evaluated.

#### Syntax and Semantics

###### Numbers and Variables

Mini-Lambda has only non-negative integers as numbers (0, 1, 2, ...). In particular, it does not have negative numbers or fractions. Ideally, numbers should be of arbitrary precision and size.

Mini-Lambda has a very permissive syntax for variables. A variable is basically anything nonempty without spaces or parenthesis other than numbers and the arrow ->. Variables are, of course, immutable. Note that \\ in variables is completely ignored; any occurrences of it are removed, so \\+\\ is the same as +.

###### Function Application and Lambda Expressions

Function application of a function f (which may be a number (although this is nonsensical and will throw an error; a number cannot be used as a function), a variable, another function application, or a lambda expression) to a value x (which may be a number, variable, another function application, or a lambda expression) uses the following syntax:

(f x)

Note that (f x1 x2 ... xn) is equivalent to ((...((f x1) x2)...) xn). (Here and throughout, ... indicates removed material which can be inferred, not a literal ...) Note also that, as a degenerate case of the above, (x) is equivalent to x; this also holds for x a number, and will not throw an error in itself.

Lambda expressions are formed as follows:

(x1 x2 ... xn -> e)

where each x is a distinct variable and e is a number, variable, function application, or another lambda expression. If e is a function application, or another lambda expression, the outermost set of parenthesis surrounding e is not needed. For example, (x -> y -> 2) is valid and equivalent to (x -> (y -> 2)). Note that a lambda expression starting with an arrow is legal; for example, (-> 5).

Lambda expressions form functions. The behavior of these functions is defined by:

((x1 x2 ... xn -> e) y1 y2 ... yn)

being the value of e with any occurrences of the variables x1, ..., xn replaced by y1, ..., yn respectively. For example, ((x y -> y) 2 3) is 3. Note that in the degenerate case where the lambda expression starts with an arrow, the value of the lambda expression is simply its value with the arrow removed, so, for example, (-> 5) is 5. Note also that a variable used in one lambda expression cannot be used in another inside of that one, so, for example, (x -> (x -> 2)) will throw an error.

Variables before -> in lambda expressions can be put inside parentheses, even nested parentheses; as long as the parentheses match, this has no impact on the evaluation of the expression. For example, (x (y z) -> x (y z)), ((((x y)) (z)) -> x (y z)), and (x y z -> x (y z)) all evaluate to the same function. Note, however, that although (\\x y -> y x) and ((x y) -> y x) are both legal and the same as (x y -> y x), (\\(x y) -> y x) will throw an error.

###### Variable Creation

New variables can be created via the syntax

var = value

New variables cannot have the same name as existing variables or be used in their own definition. Variables cannot be defined within other expressions. Note that this is allowed:

x = (x -> + x x)

This will make x be the doubling function.

###### Special cases

Empty lines are ignored, as are lines beginning with #. Lines beginning with @ may have some special effect. If they do not, an error should be thrown. Lines containing but not beginning with @ or # should be allowed and handled normally.

#### s and ^

(s x) is x + 1 for any number x. For any other x, a typechecking error will be thrown.

(^ f n x) is x if n = 0 and (f (^ f m x)) where m = n - 1 if n > 0. If n is not a number, a typechecking error will be thrown.

#### Definitions

$ = (x -> x)

Note: This is the identity function.

. = (x y z -> x (y z))

Note: This is composition.

\` = (x y z -> x z y)

Note: This changes the order of the first two arguments.

v = (x -> ^ (y -> ^ (z w -> s (y w)) (y 1) (z -> z)) x (y -> 0) 0)

Note: This subtracts one from a number if that number is not 0, and otherwise returns 0. It was initially believed to be impossible to construct.

\+ = (^ s)

Note: This function adds two numbers.

\* = (x y -> ^ (^ s x) y 0)

Note: This function multiplies two numbers.

\- = (^ v)

Note: This function returns the maximum of 0 and the first argument minus the second. As noted above, Mini-Lambda has no negative numbers.

\< = (x y -> (^ (z -> 1) (- y x) 0))

Note: This function returns 1 if its first argument is less than its second argument and 0 otherwise.

\= = (x y -> (^ (z -> 0) (+ (- y x) (- x y)) 1))

Note: This function returns 1 if its first argument is equal to its second argument and 0 otherwise.

\> = (x y -> (^ (z -> 1) (- x y) 0))

Note: This function returns 1 if its first argument is greater than its second argument and 0 otherwise.

| = (x y -> (^ (z -> x) x y))

Note: This function returns its first argument if its first argument is not zero and its second argument otherwise.

& = (x y -> (^ (z -> y) x x))

Note: This function returns its first argument if its first argument is zero and its second argument otherwise.

! = (x -> (^ (z -> 0) x 1))

Note: This function returns 1 if its argument is 0 and 0 otherwise.

d = (x y z -> (^ (w -> y) z x))

Note: We've been using this function a lot in defining earlier functions. It returns its first argument if its third argument is zero; otherwise it returns its second argument.

κ = (x y -> x)

Note: This is known as the constant function; we've also been using it a lot.

ψ = (x y z -> x z (y z))

Note: ψ, κ, and $ can be combined to remove all lambda expressions from any expression via the following rules:

(remove n) for n a number or variable is n
(remove (f x)) is ((remove f) (remove x))
(remove (x -> n)) for n a number or variable other than x is (κ n)
(remove (x -> x)) is $
(remove (x -> (f y))) is (ψ (remove (x -> f)) (remove (x -> y)))
(remove (x -> (y -> e))) is (remove (x -> (remove (y -> e))))

Note that remove is not built into the language.

min = (x y -> d x y (> x y))

Note: This function takes the minimum of two numbers.

max = (x y -> d x y (< x y))

Note: This function takes the maximum of two numbers.

bool = (d 0 1)

Note: This function returns 0 if its argument is 1 and 0 otherwise.

\<\= = (x y -> (! (> x y))

Note: This function returns 1 if its first argument is less than or equal to its second argument and 0 otherwise.

\>\= = (x y -> (! (< x y))

Note: This function returns 1 if its first argument is greater than or equal to its second argument and 0 otherwise.

\*\* = (x y -> (^ (* x) y 1))

Note: This function returns its first argument to the power of its second argument. (** 0 0) is 1.

while = (f g -> ^ (x -> d x (g x) (f x)))

Note: This function actually takes four arguments. It repeatedly applies its second argument to its fourth argument while its first argument applied to the values of the repeated application is nonzero, up to its fourth argument times. This might be confusing, so here are some examples:

(while (> 100) s 50 5) is 55.

(while (> 100) s 500 5) is 100.

% = (x y -> (^ (z -> d (s z) 0 (= (s z) y)) x 0))

Note: This function returns its first argument modulo its second. If the second argument is 0, it just returns the first argument.

/ = (x y -> v (while (. (>= x) (* y)) s (s x) 0))

Note: This function returns its first argument divided by its second, rounded down (remember that Mini-Lambda has no fractions). If its second argument is 0, it just returns the first argument. Note that (x y -> while (. (> x) (* y)) s x 0) does division rounded up, otherwise behaving the same (in particular, it is the same when there is no remainder).

$$ = $

Note: This function is always the same as $ in eventual behavior, but is different in terms of time use. $$, if its argument is a function, memoizes it; that is, if it gets an input that is not a function, it stores the output, and next time that input it given, the output will be returned almost immediately. If $$ is given an argument that is not a function, including an argument that contains a function, it returns it with no changes. Also, if $$ is given a function that returns a function, it will only cache the partially applied results, as would be expected.

An example of when to use this function is in calculating the Fibonacci sequence. On the usual interpreter,

((y -> ^ (f -> $$ (x -> d 1 (+ (f (- x 1)) (f (- x 2))) (> x 2))) y $ y) 1000)

(to get the thousandth Fibonacci number) returns the answer almost immediately, but

((y -> ^ (f -> (x -> d 1 (+ (f (- x 1)) (f (- x 2))) (> x 2))) y $ y) 25)

(to get the 25th Fibonacci number) takes a few seconds.

#### Sum and Product Types

###### Sum and product types abstractly

Types can be thought of as collections of values. A sum type (| a b) (this is not code, just type notation) has a value of either a value in type a or a value in type b. A value of type a can clearly be converted into a value of type (| a b), as can a value of type b. However, there is not always a clear way to convert a value of type (| a b) to a value of type a (or, for that matter, to a value of type b).

A product type (& a b) has a value containing both a value in type a and a value in type b. From a value of type (& a b) it is clearly possible to get a value of type a, and also clearly possible to get a value of type b. However, given only a value of type a, or only a value of type b, there is no clear way to get a value of type (& a b). (In fact, theoretically (though not in Mini-Lambda) there might be empty types with no values, and if b were such an empty type and a were not there would clearly be no values of type (& a b), and thus there would be no functions from type a to type (& a b).)

Why are these called the sum and product types? Because, if types were to have finite numbers of values (which, in Mini-Lambda, none do), the number of values of type (| a b) would be the number of values of type a plus the number of values of type b, and the number of values of type (& a b) would be the number of values of type a times the number of values of type b. (Of course, there is no function to get the number of values of a type, so this would not help in adding and multiplying numbers.)

###### Sum type

The sum type is defined by three functions <|, |>, and <|>, obeying the following laws:

(<|> f g (<| x)) = (f x)

(<|> f g (|> x)) = (g x)

The sum type can either be a left value (created by <|) or a right value (created by |>). <|>, given two functions f and g, applies one to a value of a sum type x, returning (f y) if x is a left value (<| y) and (g y) if x is a right value (|> y).

###### Product type

The product type is defined by three functions <&, &>, and <&>, obeying the following laws:

(<& (<&> f g x)) = (f x)

(&> (<&> f g x)) = (g x)

The product type contains both a left value (extracted by <&) and a right value (extracted by &>). <&>, given two functions f and g, applies both to a single value x to create a value of a product type, the left value of which is (f x) and the right value of which is (g x).

#### Further Definitions

/|/ = (f g -> <|> (. <| f) (. |> g))

Note: This function applies one of two functions to a value of a sum type depending upon whether it it a left (f) or right (g) value, but then makes the result of the function applied either a right or left value depending on which its input was.

\*\|\* = (x y -> <|> (κ x) (κ y))

Note: This function takes three arguments and returns x if its third argument is a left value and y if it is a right value.

/&/ = (f g -> <&> (. f <&) (. g &>))

Note: This function applies f to the left value of a value of a product type, g to the right value, and then returns the value of a product type containing both.

\*\&\* = (x y -> <&> (κ x) (κ y) $)

Note: This function constructs a value of a product type directly from two values. The use of $ could be any value; the choice of $ is insignificant.

#### Example Programs

Ackermann function:

(\` (^ (f y -> ^ f y (f 1))) s)

or

(\` (^ (f -> \` (^ f) (f 1))) s)

or

(\` (^ (ψ (. \` ^) (\` $ 1))) s)

Program to compute the largest prime factor of a number:

(. <& (n -> ^ (x -> d (\*\&\* (. <& &> x) (\*\&\* (. <& &> x) (/ (. &> &> x) (. <& &> x)))) (\*\&\* (<& x) (\*\&\* (s (. <& &> x)) (. &> &> x))) (% (. &> &> x) (. <& &> x))) n (\*\&\* 0 (\*\&\* 2 n))))

#### Other Information

###### Optimizations

Optimization in writing a compiler or interpreter is permitted and indeed encouraged, but not required. It is typical to implement builtins more efficiently (that is, not directly in terms of their definitions). Cacheing even without $$ is also allowed.

### Exercises

1. Someone wants to implement v by using while, specifically:

v = (x -> while (y -> (< (s y) x)) s x 0)

Will this work? Why or why not?

2. Consider the sequence of functions (.), (. .), (. . .), etc. Are all these functions well-typed? Are they all the same after some point? If so, what do they "converge" to? Can we generate them with (n -> ^ . n $)?

3. How might you represent a finite list of numbers in Mini-Lambda? How would you get the last item of such a list, or concatenate two such lists? What might be the use of cacheing in the implementation?

4. Can you use a product type of two numbers in the definition of v rather than a function? How about a sum type of two numbers?

5. Using just lambda expressions, 0, s, and ^, what is the shortest program you can write to calculate a number at least 2 ** 1024 (the classical number size limit)?

6. How would you define bitwise operators on numbers in Mini-Lambda? Is there a limit to how efficiently you can do such operations?
