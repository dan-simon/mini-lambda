## A Guide to Mini-Lambda

#### Introduction

This guide aims to explain the small functional programming language Mini-Lambda so that the reader can read and write code in the language and understand some of its theoretical underpinnings. Mini-Lambda is not meant for practical use.

#### Syntax

###### Numbers and Variables

Mini-Lambda has only non-negative integers as numbers (0, 1, 2, ...). In particular, it does not have negative numbers or fractions. Ideally, numbers should be of arbitrary precision and size.

Mini-Lambda has a very permissive syntax for variables. A variable is basically anything nonempty without spaces or parenthesis other than numbers and the arrow ->. Variables are, of course, immutable.

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
remove of (x -> n) for n a number or variable other than x is (κ n)
remove of (x -> x) is $
remove of (x -> (f y)) is (ψ (remove (x -> f)) (remove (x -> y)))
remove of (x -> (y -> e)) is (remove (x -> (remove (y -> e))))

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

#### Sum and Product types

###### Sum type

The sum type is defined by three functions <|, |>, and <|>, obeying the following laws:

(<|> f g (<| x)) = (f x)

(<|> f g (|> x)) = (g x)

The sum type can be thought of as an or type. It can either be a left value (created by <|) or a right value (created by |>). <|>, given two functions f and g, applies one to a value of a sum type x, returning (f y) if x is a left value (<| y) and (g y) if x is a right value (|> y)

###### Product type

The product type is defined by three functions <&, &>, and <&>, obeying the following laws:

(<& (<&> f g x)) = (f x)

(&> (<&> f g x)) = (g x)

The product type can be thought of as an and type. It contains both a left value (extracted by <&) and a right value (extracted by &>). <&>, given two functions f and g, applies both to a single value x to create a value of a product type, the left value of which is (f x) and the right value of which is (g x).

#### Further Definitions

\*\&\* = (x y -> <&> (κ x) (κ y) $)

Note: This function constructs a product type directly from two values. The use of $ could be any value; the choice of $ is insignificant.
