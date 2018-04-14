## A Guide to Mini-Lambda

#### Introduction

#### Notation

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

#### Sum and Product types

#### Further Definitions
