"""One-time curriculum authoring source. Generated MDX files are independently editable."""
import json, pathlib, math, re
rows=[]
def add(id,title,parents,domain,strand,intuition,law,mechanism,boundary,misconception,repair,curve,tasks):
 rows.append(dict(id=id,title=title,prerequisites=parents.split() if parents else [],domain=domain,strand=strand,intuition=intuition,law=law,mechanism=mechanism,boundary=boundary,misconception=misconception,repair=repair,curve=curve,tasks=tasks))
def t(prompt,answer,unit='',kind='numeric',choices=None):return dict(prompt=prompt,answer=answer,unit=unit,kind=kind,choices=choices)
M='math';P='physics'
add('fractions','Fractions & the whole','',M,'Foundations',
'A fraction counts equal pieces of a specified whole. Three quarters of a metre and three quarters of a minute share arithmetic, but describe different things. The denominator names the size of the piece; the numerator counts pieces.',r'\frac a b+\frac c b=\frac{a+c}{b}',
'Cut every whole into the same number of pieces before adding. Doubling both the piece count and pieces per whole leaves the amount unchanged.',
'A denominator cannot be zero. Adding denominators changes the size of the pieces and is not addition of quantities.',
'Adding denominators','Rename both fractions with one common denominator, then add only the numerators.','a*x/4',[
 t('A ribbon is {a}/4 metres long. You add {b}/4 metres. What is the total in metres?','({a}+{b})/4','m'),t('Find {a}/3 of {b} equal units. Give a decimal or fraction.','{a}*{b}/3'),t('A whole is cut into {a} equal pieces. What fraction is {b} such pieces?','{b}/{a}')])
add('signed-numbers','Direction, sign & subtraction','fractions',M,'Foundations',
'A sign encodes direction relative to a chosen zero. Debt and credit, left and right, below and above can use the same number line. Subtracting a movement means undoing it.',r'a-(-b)=a+b',
'The opposite of a number cancels it. Undoing a negative displacement therefore moves in the positive direction.',
'A negative sign may mean a negative value or an operation; parentheses distinguish the two.',
'Two negative signs always give a negative','Read subtraction as adding the opposite, then place the movement on a number line.','x-a',[
 t('Start at -{a} and move {b} units right. Where do you finish?','-{a}+{b}'),t('Evaluate {a} - (-{b}).','{a}+{b}'),t('The temperature changes from {a} to -{b} degrees. What is final minus initial?','-{b}-{a}')])
add('ratios','Ratios & proportional change','fractions',M,'Foundations',
'A ratio describes how two quantities scale together. A constant price per kilogram lets you predict any purchase without memorizing a table. Scaling both quantities equally preserves the ratio.',r'y=kx',
'Divide the output by the input to find the constant of proportionality. Multiplication rebuilds the output for a new input.',
'Proportionality requires a fixed ratio and passes through zero. A taxi fare with a starting fee is not proportional.',
'Adding the same amount preserves a ratio','Double both members of a ratio and compare their quotient.','a*x',[
 t('{a} identical parts cost {b} currency units. What do 6 parts cost?','6*{b}/{a}'),t('A recipe uses {a} cups per batch. How many cups for {b} batches?','{a}*{b}'),t('A map uses {a} cm for 1 km. How many km correspond to {b} cm?','{b}/{a}','km')])
add('exponents','Powers & scaling','signed-numbers ratios',M,'Foundations',
'A power records repeated multiplication, so it describes repeated scaling. Squaring a length scales an area; doubling a side multiplies the area by four.',r'x^m x^n=x^{m+n}',
'Count the factors of x in each group. Joining the groups adds factor counts; taking a power of a power multiplies those counts.',
'Fractional powers of negative real numbers require domain care. A negative exponent is a reciprocal, not a negative result.',
'Confusing powers of powers with sums','Expand two small powers into repeated factors before using the rule.','x^a',[
 t('Evaluate 2^{a}.','2^{a}'),t('Evaluate {a}^2 times {a}^3.','{a}^5'),t('Evaluate {a}^(-2).','1/{a}^2')])
add('equations','Equations as balanced constraints','signed-numbers ratios',M,'Algebra',
'An equation says that two descriptions have the same value. Solving finds the value that makes the constraint true. A balance remains level when the same reversible operation is applied to both sides.',r'ax+b=c\quad\Rightarrow\quad x=\frac{c-b}{a}',
'Undo addition first, then undo multiplication. Substitute the candidate into the original constraint to verify it.',
'Dividing by an expression that could be zero can remove solutions. Multiplying both sides by zero loses information.',
'Moving a term without an inverse operation','Write the same subtraction explicitly on both sides before simplifying.','a*x+2',[
 t('Solve {a}x + {b} = {a}*6 + {b}.','6'),t('Solve {a}x = {b}.','{b}/{a}'),t('Solve x/{a} - {b} = 2.','{a}*(2+{b})')])
add('inequalities','Inequalities & order','equations',M,'Algebra',
'An inequality names a region of possible values rather than one balance point. Multiplication by a negative number reflects the number line, reversing left and right.',r'a<b\;\Rightarrow\;-a>-b',
'Test the order with two concrete numbers. Their negatives appear in the opposite order on the same axis.',
'Squaring preserves order only with appropriate sign restrictions. The square function folds both sides of zero together.',
'Keeping the inequality sign when dividing by a negative','Place -2 and -5 on a number line; the reflected order explains the flip.','-a*x',[
 t('For -{a}x < -{a}*{b}, what is the boundary value of x?','{b}'),t('Which direction is correct after dividing -2x < 6 by -2?','x > -3',kind='choice',choices=['x > -3','x < -3','x = -3']),t('For x + {a} < {b}, find the boundary value.','{b}-{a}')])
add('coordinates','Coordinates & distance','signed-numbers exponents',M,'Geometry',
'Coordinates turn location into numbers relative to an origin and axes. The distance between two points depends on the change along each axis, not their absolute addresses.',r'd=\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}',
'The horizontal and vertical differences form perpendicular sides of a right triangle. Pythagoras supplies the straight-line distance.',
'This formula assumes flat Euclidean space and matching axis units. A map projection can distort physical distances.',
'Adding coordinates instead of subtracting','Translate both points by the same vector: their separation must stay unchanged.','sqrt(x^2+a^2)',[
 t('Find the distance from (0,0) to ({a},{b}).','sqrt({a}^2+{b}^2)'),t('A point moves from x=-{a} to x={b}. Find its signed displacement.','{a}+{b}'),t('On the x-axis, place the point whose coordinate is {a}+{b}. Enter its x-coordinate.','{a}+{b}',kind='point')])
add('slope','Slope is a rate','coordinates ratios',M,'Algebra',
'Slope compares a vertical change with the horizontal change that produced it. A steep line changes output quickly. A position-time slope measures speed with direction.',r'm=\frac{\Delta y}{\Delta x}',
'For a straight line every right triangle along it is similar, so rise divided by run is constant.',
'Vertical lines have no finite slope. A curved graph has different secant slopes on different intervals.',
'Reversing rise and run','Write the units of output divided by units of input before inserting numbers.','a*x',[
 t('y rises {a} while x rises {b}. Find slope.','{a}/{b}'),t('A line has slope {a}. What is its change in y over a run of {b}?','{a}*{b}'),t('Find slope from (1,{a}) to (3,{b}).','({b}-{a})/2')])
add('linear-functions','Linear models & intercepts','slope equations',M,'Algebra',
'A linear model combines a starting value with a constant rate of change. The intercept tells you where counting begins; the slope tells you how the total changes per step.',r'f(x)=mx+b',
'Start at b when x is zero, then add m for each unit of input. Equal input increments produce equal output increments.',
'A linear extrapolation may fail outside the measured range; physical rates are seldom constant forever.',
'Treating the intercept as the slope','Read f(0) first, then compare f(1) with f(0).','a*x+3',[
 t('For f(x)={a}x+{b}, find f(3).','3*{a}+{b}'),t('A line has f(0)={b} and slope {a}. Find f(2).','2*{a}+{b}'),t('Find x when {a}x+{b}={a}*4+{b}.','4')])
add('systems','Systems & intersecting constraints','linear-functions',M,'Algebra',
'Two equations constrain the same unknowns. Their common solution is where both stories are true at once. Elimination combines constraints so one unknown cancels.',r'x+y=s,\quad x-y=d\quad\Rightarrow\quad x=\frac{s+d}{2}',
'Add the equations: positive y and negative y cancel, leaving twice x. Recover y by substitution.',
'Parallel distinct lines have no common solution; coincident lines have infinitely many. A numerical solver must detect both cases.',
'Combining only one side of the equations','Add the entire left sides and entire right sides as equal quantities.','a-x',[
 t('Solve x+y={a}+{b}, x-y={a}-{b}. Enter x.','{a}'),t('Solve x+y={a}+{b}, x-y={a}-{b}. Enter y.','{b}'),t('If 2x+y={a} and x+y={b}, find x.','{a}-{b}')])
add('quadratics','Quadratics & completing a square','exponents equations',M,'Algebra',
'A square grows by more with each equal step away from its minimum. Completing a square reveals the centre of that growth, converting an expanded expression into a shifted parabola.',r'x^2+2hx+h^2=(x+h)^2',
'A square of side x+h contains an x-square, two rectangles of area hx and a corner of area h squared.',
'A real quadratic may have no real roots. Taking a square root introduces both signs when solving an equation.',
'Forgetting the negative square root','Check both +r and -r in x squared equals r squared.','x^2+a*x',[
 t('What constant completes x^2 + 2*{a}x into a perfect square?','{a}^2'),t('For f(x)=(x-{a})^2+{b}, where is the minimum x-coordinate?','{a}'),t('Find the positive root of x^2={a}^2.','{a}')])
add('functions','Functions & domains','linear-functions quadratics',M,'Functions',
'A function is a rule assigning exactly one output to each allowed input. The domain is part of the rule: division, square roots and physical constraints can exclude inputs.',r'f:A\to B,\qquad x\mapsto f(x)',
'A machine view helps separate a symbol for an input from the value currently placed in the machine. Substitution replaces every occurrence of that input.',
'A relation such as a whole circle can give two y values for one x and is not a single function y=f(x).',
'Assuming every expression accepts every real input','Locate denominators and roots before evaluating; ask which inputs make them undefined.','a*x^2',[
 t('For f(x)=x^2+{a}, find f({b}).','{b}^2+{a}'),t('For f(x)=1/(x-{a}), which input is excluded?','{a}'),t('For f(x)=sqrt(x+{a}), what is the smallest allowed real input?','-{a}')])
add('composition','Composition: one change inside another','functions',M,'Functions',
'Composition feeds the output of one process into another. Order matters: warming water then measuring expansion is a different sequence from scaling a temperature reading first.',r'(f\circ g)(x)=f(g(x))',
'Evaluate the inner function, then treat that result as the outer function input. Keep parentheses around the whole inner expression.',
'The output of the inner rule must lie in the outer domain. Composition is generally not commutative.',
'Replacing composition with multiplication','Draw two machines in sequence and label the intermediate value.','(a*x+1)^2',[
 t('f(x)=x^2, g(x)=x+{a}. Find f(g({b})).','({a}+{b})^2'),t('f(x)={a}x, g(x)=x+{b}. Find g(f(2)).','2*{a}+{b}'),t('f(x)=x+{a}, g(x)={b}x. Find f(g(3)).','3*{b}+{a}')])
add('inverse-functions','Inverse functions & undoing','functions equations',M,'Functions',
'An inverse reconstructs the input from an output. It exists as a function only when different allowed inputs do not collapse onto the same output.',r'f^{-1}(f(x))=x',
'Swap the input and output roles, then solve the original relation for the old input. Restrict a domain if information was lost.',
'The inverse of x squared requires a chosen branch. The notation f inverse does not mean the reciprocal 1/f.',
'Confusing inverse and reciprocal','Test whether applying your candidate after f returns the original input.','(x-2)/a',[
 t('f(x)={a}x+{b}. Find f inverse at {b}+{a}*3.','3'),t('f(x)=x/{a}. Find f inverse at {b}.','{a}*{b}'),t('On x>=0, f(x)=x^2. Find f inverse at {a}^2.','{a}')])
add('radians','Radians: angle from arc length','ratios coordinates',M,'Trigonometry',
'An angle compares travelled arc length with radius. Measuring it this way makes a full turn the same number for every circle, and removes conversion factors from calculus.',r'\theta=s/r,\qquad 2\pi\text{ radians per turn}',
'Doubling the radius doubles the arc for the same opening. Their ratio depends only on the angle.',
'Calculus trigonometric rules assume radians. Degree inputs need a factor of pi/180.',
'Using degrees inside derivative formulas','Convert to arc length divided by radius before applying a calculus identity.','a*x',[
 t('An arc is {a} m long on radius {b} m. Find the angle in radians.','{a}/{b}','rad'),t('What is the arc length for radius {a} m and angle {b} radians?','{a}*{b}','m'),t('Convert {a} complete turns to radians.','2*pi*{a}','rad')])
add('trig','Trigonometry as projection','radians coordinates',M,'Trigonometry',
'A rotating radius has horizontal and vertical shadows. Cosine and sine are those shadows divided by radius. The unit circle extends right-triangle ratios to every angle.',r'x=r\cos\theta,\quad y=r\sin\theta,\quad \sin^2\theta+\cos^2\theta=1',
'Pythagoras applied to the two projections gives the identity. Signs follow the quadrant, not a memorized triangle.',
'Tangent is undefined when cosine is zero. Inverse trig functions return principal branches, not every possible angle.',
'Swapping the adjacent and opposite sides','Draw the angle against the horizontal axis and trace its horizontal shadow.','a*sin(x)',[
 t('A radius is {a} m. Find its vertical projection at pi/2 radians.','{a}','m'),t('A vector has magnitude {a}. Find its horizontal component at pi/3.','{a}/2'),t('Evaluate sin(pi)^2+cos(pi)^2.','1')])
add('vectors','Vectors & components','trig signed-numbers',M,'Vectors',
'A vector carries both size and direction. Components record independent changes along chosen axes, so vector addition is just combining those changes axis by axis.',r'\mathbf a+\mathbf b=(a_x+b_x,a_y+b_y)',
'Place the second arrow at the head of the first. The final displacement equals the sum of horizontal and vertical movements.',
'Components depend on the coordinate axes; the physical arrow does not. A vector magnitude is never a signed component.',
'Adding magnitudes for nonparallel vectors','Add each component first, then take the length of the resulting vector.','sqrt(x^2+a^2)',[
 t('Add ({a},2) and ({b},3). Enter the x-component.','{a}+{b}'),t('Find the magnitude of ({a},{b}).','sqrt({a}^2+{b}^2)'),t('A vector ({a},{b}) is multiplied by -2. Enter its y-component.','-2*{b}')])
add('dot-product','Dot product & alignment','vectors',M,'Vectors',
'The dot product measures how much one vector points along another. A perpendicular push contributes no displacement-direction work, even if the force is large.',r'\mathbf a\cdot\mathbf b=a_xb_x+a_yb_y=|a||b|\cos\theta',
'Project one vector onto the direction of the other and multiply by its length. Component products encode that same aligned part.',
'The dot product is a scalar. It cannot measure the turning direction that a cross product captures.',
'Using a sine for aligned work','Parallel vectors must have maximal positive dot product; test the angle-zero case.','a*x',[
 t('Find ({a},2) dot ({b},3).','{a}*{b}+6'),t('Find ({a},0) dot (0,{b}).','0'),t('Find v dot v for v=({a},{b}).','{a}^2+{b}^2')])
add('limits','Limits: a local destination','functions inequalities',M,'Calculus',
'A limit asks where outputs head as inputs approach a point. It deliberately separates nearby behavior from the value written at the point itself.',r'\lim_{x\to a}f(x)=L',
'For a polynomial, each arithmetic operation preserves small changes, so approaching a forces the output toward its substituted value. A removable hole can have a limit despite being undefined.',
'Left and right approaches must agree. A vertical blow-up is not a finite limit; oscillation can prevent any destination.',
'Equating the limit with the value at a hole','Factor the expression away from the excluded point, then approach without substituting into zero divided by zero.','(x+a)',[
 t('Find the limit of {a}x+{b} as x approaches 2.','2*{a}+{b}'),t('Find the limit of (x^2-{a}^2)/(x-{a}) as x approaches {a}.','2*{a}'),t('Find the limit of x^2+{b} as x approaches {a}.','{a}^2+{b}')])
add('continuity','Continuity & unbroken local change','limits',M,'Calculus',
'Continuity means that nearby inputs produce outputs near the output at the point. The graph has no missing value or jump at that location.',r'\lim_{x\to a}f(x)=f(a)',
'Existence of the nearby limit and equality with the actual value are separate checks. Filling a removable hole with its limit restores continuity.',
'Continuity does not guarantee a derivative: an absolute-value corner is continuous but has conflicting one-sided slopes.',
'Assuming continuity guarantees smoothness','Compare the left and right slopes at the corner of an absolute-value graph.','abs(x-a)',[
 t('To make f continuous at x={a}, set f({a}) equal to the limit of 2x+{b}. What value is needed?','2*{a}+{b}'),t('What value fills the hole in (x^2-{a}^2)/(x-{a}) at x={a}?','2*{a}'),t('Does continuity alone guarantee differentiability?','No',kind='choice',choices=['No','Yes','Only for positive values'])])
add('derivative','The derivative: change under a microscope','limits slope',M,'Calculus',
'Zoom into a smooth curve until it resembles a straight line. The derivative is the slope of that local line: output change per tiny input change. For position, that rate is velocity.',r'f\prime(x)=\lim_{h\to0}\frac{f(x+h)-f(x)}h',
'For x squared, the secant quotient expands to 2x+h. As the interval shrinks, the extra h vanishes and leaves 2x.',
'A corner or jump can destroy the limit. A derivative is a rate at a point, not the total change across a wide interval.',
'Using f(x)/x as the derivative','Compare two nearby outputs and divide their difference by the input difference.','x^2*a',[
 t('For f(x)=x^2, find the derivative at x={a}.','2*{a}'),t('For f(x)={a}x+{b}, find its derivative.','{a}'),t('A position is x(t)={a}t^2 metres. Find instantaneous velocity at t=2 s.','4*{a}','m/s')])
add('power-rule','Power rule & local scaling','derivative exponents',M,'Calculus',
'When a power changes a little, each repeated factor contributes one leading-order change. The number of factors becomes the coefficient of the derivative.',r'\frac{d}{dx}x^n=nx^{n-1}',
'Expand (x+h) to the nth power. After subtracting x to the nth power and dividing by h, only the term with one h survives the limit.',
'Negative and fractional powers require the original domain. At zero, a fractional power may fail to have a finite derivative.',
'Reducing the power but forgetting its coefficient','Count which of the n factors supplied the one small change.','a*x^3',[
 t('For f(x)={a}x^3, find f prime at x=2.','12*{a}'),t('Differentiate {a}x^2. Type an expression in x.','2*{a}*x',kind='symbolic'),t('For f(x)=x^{a}, find f prime at x=1.','{a}')])
add('chain-rule','Chain rule: linked rates','composition derivative',M,'Calculus',
'If one quantity changes because another changed, the total rate multiplies the two local conversion rates. Metres per turn times turns per second gives metres per second.',r'\frac{d}{dx}f(g(x))=f\prime(g(x))g\prime(x)',
'The inner change is approximately g prime times the input change. The outer change is f prime times that inner change. Divide by the original input change.',
'Both derivatives are evaluated at their own inputs. Omitting the inner rate gives the wrong units and the wrong scale.',
'Differentiating only the outside','Name the intermediate variable u, then write output per u times u per x.','(a*x+1)^2',[
 t('For f(x)=({a}x+{b})^2, find f prime at x=0.','2*{a}*{b}'),t('Differentiate ({a}x+1)^2.','2*{a}*({a}*x+1)',kind='symbolic'),t('If dy/du={a} and du/dx={b}, find dy/dx.','{a}*{b}')])
add('product-rule','Product rule: two changing factors','derivative quadratics',M,'Calculus',
'The area of a rectangle changes when either side changes. Two thin strips contribute at first order; their tiny corner contributes only second-order area.',r'(uv)\prime=u\prime v+uv\prime',
'Expand (u+du)(v+dv)-uv. The terms v du and u dv survive division by the input step; du dv vanishes in the derivative limit.',
'The derivative of a product is not the product of derivatives. This rule assumes both factors are differentiable.',
'Multiplying the two derivatives','Sketch the two thin area strips; each retains one original side.','x*(x+a)',[
 t('u(0)={a}, u prime(0)=2, v(0)={b}, v prime(0)=3. Find (uv) prime(0).','2*{b}+3*{a}'),t('Differentiate x*(x+{a}).','2*x+{a}',kind='symbolic'),t('For f(x)=x^2*x^3, find f prime at x=1.','5')])
add('trig-derivatives','Rates on the unit circle','trig derivative chain-rule',M,'Calculus',
'A point moving around a unit circle has a tangent velocity perpendicular to its radius. Its vertical coordinate is sine; the vertical component of the tangent is cosine.',r'(\sin x)\prime=\cos x,\qquad(\cos x)\prime=-\sin x',
'A small radian angle sweeps an arc nearly equal to its chord. The tangent direction turns the radius by a quarter turn, giving the component rates.',
'These rates use radians. Degrees introduce an extra pi/180 scale factor.',
'Forgetting the minus sign for cosine','At a small positive angle cosine is decreasing, so its derivative must be negative.','sin(a*x)',[
 t('For f(x)=sin({a}x), find f prime at x=0.','{a}'),t('For f(x)=cos({a}x), find f prime at x=0.','0'),t('Find the derivative of sin(x) at x=pi.','-1')])
add('exponential','Exponential change & natural growth','exponents chain-rule',M,'Calculus',
'Exponential growth changes in proportion to what is already present. Equal time intervals multiply the amount by the same factor. The natural base makes the instantaneous rate equal the amount itself.',r'\frac{d}{dx}e^{kx}=ke^{kx}',
'The growth law y prime equals ky says each small interval adds k times the current amount times the interval length. Repeated small multiplications converge to an exponential.',
'A constant growth fraction is a model assumption. Resource limits make long-term unlimited growth unrealistic.',
'Confusing constant addition with constant percentage growth','Compare equal time intervals: differences are fixed for linear growth, ratios for exponential growth.','exp(a*x/4)',[
 t('For f(x)=exp({a}x), find f prime at x=0.','{a}'),t('An amount starts at {a} and doubles {b} times. Find the amount.','{a}*2^{b}'),t('If y prime={a}y and y(0)={b}, find y prime(0).','{a}*{b}')])
add('logarithms','Logarithms & relative change','inverse-functions exponential',M,'Calculus',
'A logarithm counts multiplicative growth steps. Because it undoes exponentiation, it turns products into sums and measures relative rather than absolute scale.',r'\ln(ab)=\ln a+\ln b,\qquad(\ln x)\prime=1/x',
'Differentiate exp(ln x)=x with the chain rule: exp(ln x) times the unknown derivative is 1. Since exp(ln x)=x, the rate is 1/x.',
'The real natural logarithm accepts only positive inputs. Logarithms do not distribute across addition.',
'Treating log of a sum as sum of logs','Test ln(1+1) against ln(1)+ln(1); the right side is zero.','ln(x+a)',[
 t('Find the derivative of ln(x) at x={a}.','1/{a}'),t('Evaluate ln(exp({a})).','{a}'),t('For f(x)=ln({a}x), find f prime at x={b}.','1/{b}')])
add('tangent','Tangent lines & local prediction','derivative linear-functions',M,'Calculus',
'A tangent line is the best first-order prediction near a known point. It keeps the known value and extends with the instantaneous slope.',r'f(a+h)\approx f(a)+f\prime(a)h',
'The derivative definition makes the error smaller than the input change as that change tends to zero. The line captures what survives at first order.',
'Approximation error grows with distance and curvature. A tangent is local information, not an exact global replacement.',
'Using the slope without anchoring the line','Start the tangent at (a,f(a)); only then add slope times displacement.','a^2+2*a*(x-a)',[
 t('Use the tangent to x^2 at x={a} to estimate f({a}+0.1).','{a}^2+0.2*{a}'),t('At x=0 a function is {b} with derivative {a}. Predict its tangent value at x=2.','{b}+2*{a}'),t('For x^2, what is the slope of the tangent at x={a}?','2*{a}')])
add('optimization','Optimization & the shape of change','power-rule inequalities',M,'Calculus',
'At an interior smooth maximum or minimum, a function stops increasing before changing direction. The derivative identifies candidates; the surrounding shape decides what kind they are.',r'f\prime(x_*)=0\quad\text{at an interior differentiable extremum}',
'If the derivative were positive at a supposed interior maximum, a small step right would increase the value. A negative derivative would allow a step left.',
'Endpoints and corners may also be extrema. A zero derivative can be a flat crossing, so check sign changes or curvature.',
'Calling every stationary point a maximum','Compare derivative signs on both sides of the candidate.','-(x-a)^2+8',[
 t('Find the x maximizing -(x-{a})^2+{b}.','{a}'),t('Find the minimum value of (x-{a})^2+{b}.','{b}'),t('A rectangle has sides x and {a}+{b}-x. Which x maximizes area?','({a}+{b})/2')])
add('integral','Integration: adding continuous change','limits power-rule',M,'Calculus',
'An integral accumulates many tiny contributions. A velocity-time strip has height velocity and width time, so its area is a small displacement. Refining the strips captures changing rates.',r'\int_a^b f(x)\,dx=\lim_{n\to\infty}\sum f(x_i)\Delta x',
'Partition the input interval, multiply each local rate by its small width, and add. Positive and negative contributions keep their signs.',
'A signed integral is not always geometric area. Convergence needs checking for unbounded functions or intervals.',
'Dropping the width of a strip','Check dimensions: a rate must be multiplied by an input interval before it becomes a total.','a*x',[
 t('A constant rate is {a} per second for {b} seconds. Find its accumulated total.','{a}*{b}'),t('Integrate {a}x from 0 to {b}.','{a}*{b}^2/2'),t('Integrate x^2 from 0 to {a}.','{a}^3/3')])
add('fundamental-theorem','The bridge between rate & accumulation','integral continuity derivative',M,'Calculus',
'Accumulating a continuous rate and then asking how fast the accumulated amount changes returns the original rate. Differentiation and integration undo each other under the right conditions.',r'\frac{d}{dx}\int_a^x f(t)\,dt=f(x),\qquad\int_a^b F\prime=F(b)-F(a)',
'Adding a short interval contributes approximately f(x) times its width. Divide by that width and shrink it; continuity forces the average height toward f(x).',
'The first form needs continuity at the evaluation point; the evaluation formula requires a suitable antiderivative.',
'Confusing an antiderivative with a definite total','A definite integral is an endpoint difference; the arbitrary constant cancels.','x^a/a',[
 t('F(x)=x^2. Evaluate the integral of F prime from {a} to {b}.','{b}^2-{a}^2'),t('If A(x)=integral from 0 to x of t^2 dt, find A prime({a}).','{a}^2'),t('Complete the argument: the average height over a shrinking interval approaches f(x) because of ___.','continuity',kind='proof',choices=['continuity','a positive slope','an arbitrary constant'])])
add('substitution','Substitution: accumulate through a new variable','fundamental-theorem chain-rule',M,'Calculus',
'A change of variable renames the inner process and accounts for how its scale changes. It is the chain rule read backward.',r'\int f(g(x))g\prime(x)\,dx=\int f(u)\,du',
'Set u=g(x). Its differential du includes the inner rate g prime times dx, so both the integrand and interval measure transform together.',
'For definite integrals, change the bounds too. A missing derivative factor makes a tempting substitution invalid.',
'Changing the integrand but keeping old bounds','Label each bound with its variable; map both endpoints through u=g(x).','(x^2+a)^2',[
 t('Integrate 2x*(x^2+{a}) from 0 to 1.','{a}+0.5'),t('For u=x^2+{a}, find u when x={b}.','{b}^2+{a}'),t('Integrate {a}*exp({a}x) from 0 to 1.','exp({a})-1')])
add('area','Signed area & total area','integral functions',M,'Calculus',
'A signed accumulation cancels portions below the axis against portions above it. Physical totals such as distance need nonnegative contributions, so the sign must be handled before adding.',r'\text{area}=\int_a^b |f(x)|\,dx',
'Split at zero crossings, reverse the sign of negative portions, and add the positive pieces. Between two graphs use upper minus lower.',
'Integrating before locating crossings can give cancellation instead of total area.',
'Calling every signed integral an area','Shade the negative part and decide whether the question asks net change or total magnitude.','abs(x-a)',[
 t('Find the area under y={a} from x=0 to x={b}.','{a}*{b}'),t('Find the total area between y=x and the axis from -{a} to {a}.','{a}^2'),t('Find the area between y={a}+{b} and y={b} on [0,2].','2*{a}')])
add('differential-equations','Dynamics as a rate law','exponential integral',M,'Calculus',
'A differential equation specifies how a state changes rather than listing every future state. An initial condition chooses one trajectory from the family allowed by the law.',r'\dot y=ky,\qquad y(0)=y_0\quad\Rightarrow\quad y=y_0e^{kt}',
'The exponential has exactly the required proportional rate; the initial value fixes its multiplier. Verify both the rate equation and the starting value.',
'A rate law without an initial condition usually does not determine a unique solution. More complex laws may need numerical integration.',
'Ignoring the initial condition','Substitute t=0 into the proposed trajectory as a separate check.','a*exp(x/3)',[
 t('For y prime=2y and y(0)={a}, find y prime(0).','2*{a}'),t('For y prime={a} and y(0)={b}, find y(2).','2*{a}+{b}'),t('For y prime=y, y(0)={a}, find y(1).','{a}*exp(1)')])
add('units','Units & dimensional arguments','ratios exponents',P,'Mechanics',
'A unit is part of a measurement, not an annotation added afterward. A rate divides one kind of quantity by another. Dimensional consistency lets you reject equations before calculating.',r'[v]=LT^{-1},\quad[a]=LT^{-2},\quad[F]=MLT^{-2}',
'Speed is displacement per elapsed time. Acceleration is the change in that speed per elapsed time, introducing a second time denominator.',
'Dimensions constrain a formula but cannot fix dimensionless constants or prove a physical law. Angles in radians are dimensionless ratios.',
'Treating a correct number as sufficient','State what quantity is measured and derive its unit from the defining ratio.','a*x',[
 t('Convert {a} kilometres to metres.','1000*{a}','m'),t('An object travels {a} m in {b} s. Find average speed.','{a}/{b}','m/s'),t('A mass of {a} kg accelerates at {b} m/s^2. Find force.','{a}*{b}','N')])
add('position','Position, displacement & a reference frame','coordinates units',P,'Mechanics',
'Position names where an object is relative to a chosen origin. Displacement compares the final position with the initial one; changing the origin shifts both and leaves the displacement unchanged.',r'\Delta x=x_f-x_i',
'Write final and initial coordinates in the same frame. Their difference cancels the arbitrary origin offset.',
'Displacement is not distance travelled. A round trip can have zero displacement and substantial path length.',
'Confusing distance with displacement','Mark the endpoints separately from the path taken between them.','a+x',[
 t('An object moves from -{a} m to {b} m. Find displacement.','{a}+{b}','m'),t('An object starts at {a} m, moves {b} m right, then {b} m left. Find displacement.','0','m'),t('Start at {a} m and move {b} m left. Find final position.','{a}-{b}','m')])
add('velocity','Velocity is the derivative of position','position derivative',P,'Mechanics',
'Velocity tells how quickly location changes and in which direction. The slope of a position-time graph is velocity; a curved position graph therefore means changing velocity.',r'v=\frac{dx}{dt},\qquad\Delta x=\int v\,dt',
'Average velocity is displacement divided by elapsed time. Shrinking the interval produces the position derivative, linking motion to local slope.',
'Speed is the magnitude of velocity. Zero average velocity does not mean the object stayed still.',
'Reading graph height as velocity','Use a small right triangle on the position graph and compute its slope.','a*x^2',[
 t('For x(t)={a}t^2 m, find v at t={b} s.','2*{a}*{b}','m/s'),t('A displacement is {a} m over {b} s. Find average velocity.','{a}/{b}','m/s'),t('For x(t)={a}t+{b} m, find velocity.','{a}','m/s')])
add('acceleration','Acceleration & changing velocity','velocity derivative',P,'Mechanics',
'Acceleration measures the rate of velocity change. It can change direction, speed, or both. A negative acceleration is a direction on the chosen axis, not automatically slowing down.',r'a=\frac{dv}{dt}=\frac{d^2x}{dt^2}',
'Apply the local-rate definition to velocity. Integrating acceleration reconstructs velocity up to its initial value.',
'An object moving left can speed up with negative acceleration. Slowing depends on the relative signs of velocity and acceleration.',
'Negative acceleration always means slowing','Compare the signs of velocity and acceleration: matching signs increase speed in one dimension.','a*x',[
 t('Velocity changes from {a} m/s to {b} m/s in 2 s. Find average acceleration.','({b}-{a})/2','m/s^2'),t('For v(t)={a}t^2 m/s, find acceleration at t=2 s.','4*{a}','m/s^2'),t('For x(t)={a}t^2+{b}t m, find acceleration.','2*{a}','m/s^2')])
add('constant-acceleration','Motion under constant acceleration','acceleration integral',P,'Mechanics',
'Constant acceleration adds equal amounts of velocity in equal times. The velocity-time graph is a line, so displacement is the area of a rectangle plus a triangle.',r'v=v_0+at,\qquad x=x_0+v_0t+\tfrac12at^2',
'Integrate the constant rate once to get velocity. Integrate that linear velocity again to get position, retaining both initial conditions.',
'These formulas assume a is constant over the whole interval. They cannot be applied unchanged to drag or a spring.',
'Forgetting the one-half in displacement','The added velocity builds from zero; its average over the interval is half its final value.','x+a*x^2/2',[
 t('From rest, acceleration is {a} m/s^2 for {b} s. Find final velocity.','{a}*{b}','m/s'),t('From rest at x=0, accelerate at {a} m/s^2 for {b} s. Find displacement.','0.5*{a}*{b}^2','m'),t('Initial velocity is {a} m/s; acceleration is 2 m/s^2. Find velocity after {b} s.','{a}+2*{b}','m/s')])
add('free-fall','Free fall & gravitational acceleration','constant-acceleration newton-2',P,'Mechanics',
'Without air resistance, near-Earth gravity accelerates all freely falling objects equally. Mass increases both gravitational force and resistance to acceleration, so it cancels.',r'ma=-mg\quad\Rightarrow\quad a=-g',
'Choose upward positive. Gravitational force points downward, so Newton second law gives negative acceleration. Integrate that constant rate for velocity and height.',
'Near-surface constant g and negligible air resistance are approximations. Different drag-to-mass ratios break the equal-fall prediction.',
'Heavier objects fall faster in vacuum','Write both the force mg and inertial factor m, then cancel the same nonzero mass.','a*x-5*x^2',[
 t('Use g=10 m/s^2. Drop from rest for {a} s. Find downward distance.','5*{a}^2','m'),t('Launch upward at {a}*10 m/s with g=10. Find time to the top.','{a}','s'),t('With g=10, find maximum height for upward speed {a}*10 m/s.','5*{a}^2','m')])
add('projectile','Projectile motion & independent components','free-fall vectors trig',P,'Mechanics',
'A projectile combines horizontal motion with vertical free fall. Gravity changes only the vertical component when air resistance is ignored; both components share the same clock.',r'x=v_0\cos\theta\,t,\qquad y=v_0\sin\theta\,t-\tfrac12gt^2',
'Project the launch velocity onto two axes. Apply zero acceleration horizontally and negative g vertically, then integrate each component.',
'The familiar 45-degree maximum range assumes equal launch and landing heights, no air resistance and fixed launch speed.',
'Gravity gradually removes horizontal velocity','Separate horizontal and vertical forces before writing component acceleration.','a*x-0.5*x^2',[
 t('Horizontal velocity is {a} m/s. Flight lasts {b} s. Find range.','{a}*{b}','m'),t('Use g=10. Upward initial velocity is {a}*10 m/s, same-height landing. Find total flight time.','2*{a}','s'),t('For fixed launch speed on level ground without drag, enter the range-maximizing angle in degrees.','45',kind='simulation')])
add('newton-1','Inertia & the meaning of net force','velocity vectors',P,'Mechanics',
'Uniform motion does not need a continuing push. Net force measures the change in motion, not motion itself. Zero net force allows any constant velocity in an inertial frame.',r'\sum\mathbf F=0\quad\Rightarrow\quad\mathbf v=\text{constant}',
'Newton first law defines inertial frames: frames where force-free bodies maintain velocity. The second law preserves this condition when net force vanishes.',
'Accelerating frames need additional inertial terms. Zero velocity at an instant does not establish zero force.',
'A moving object must have a forward net force','Imagine friction removed: constant velocity has no changing momentum to explain.','a*x',[
 t('An object moves at {a} m/s with zero net force. Find velocity after {b} s.','{a}','m/s'),t('An inertial object has zero net force. Find acceleration.','0','m/s^2'),t('Two opposite horizontal forces have equal magnitude {a} N. Find net horizontal force.','0','N')])
add('newton-2','Force, mass & the rate of change','newton-1 acceleration equations',P,'Mechanics',
'Force changes momentum. For a constant mass, it changes velocity at a rate proportional to the net force and inversely proportional to the mass. The vector sum matters, not any single push.',r'\sum\mathbf F=m\mathbf a',
'Begin with net force as momentum rate: F=dp/dt. For constant mass p=mv, differentiation gives m dv/dt, so F=ma.',
'Use the total external force and constant mass. Variable-mass systems require a momentum-flow account rather than blindly using F=ma.',
'Using the largest force instead of the net force','Add signed force components first, then divide by the mass.','a*x^2/2',[
 t('A net force of {a} N acts on mass {b} kg. Find acceleration.','{a}/{b}','m/s^2'),t('Mass {a} kg accelerates at {b} m/s^2. Find net force.','{a}*{b}','N'),t('Forces {a} N right and {b} N left act on 2 kg. Find signed acceleration.','({a}-{b})/2','m/s^2')])
add('free-body','Free-body diagrams & force balance','newton-2 vectors',P,'Mechanics',
'A free-body diagram isolates one object and lists interactions acting on it. Contact forces and long-range forces enter the same vector sum, while forces exerted by the object belong on another diagram.',r'\sum F_x=ma_x,\qquad\sum F_y=ma_y',
'Choose the body and axes, identify external interactions, resolve components, and apply Newton second law separately along each axis.',
'Normal force need not equal weight. An accelerating lift or an angled push changes the vertical force balance.',
'Drawing both action and reaction on one body','Label the object receiving each force; third-law partners act on different bodies.','a*x',[
 t('A {a} kg body rests on a horizontal table. Use g=10. Find the normal force.','10*{a}','N'),t('A {a} kg lift accelerates upward at {b} m/s^2. Use g=10. Find support force.','{a}*(10+{b})','N'),t('Order the modelling steps. Enter letters separated by commas: A sum components; B isolate body; C solve acceleration.','B,A,C',kind='ordering')])
add('friction','Friction: a constraint & a threshold','free-body inequalities',P,'Mechanics',
'Static friction supplies only the force needed to prevent relative slipping, up to a limit. Once surfaces slide, kinetic friction is often approximated by a fixed coefficient times normal force.',r'|f_s|\le\mu_sN,\qquad |f_k|=\mu_kN',
'Use horizontal force balance to find required static friction, then compare it with its maximum. Use the kinetic model only after slipping is established.',
'The coefficients are empirical approximations; friction can depend on speed, surface condition and temperature.',
'Static friction always equals its maximum','Compute the force required for no slip before comparing against the ceiling.','a*x/10',[
 t('A surface has N={a}*10 N and kinetic coefficient 0.2. Find kinetic friction magnitude.','2*{a}','N'),t('Maximum static friction is {a}+{b} N. A horizontal push of {a} N is balanced. Find actual friction magnitude.','{a}','N'),t('N={a}*10 N and static coefficient 0.5. Find maximum static friction.','5*{a}','N')])
add('work','Work: force accumulated along a path','dot-product integral newton-2',P,'Energy',
'Work measures energy transferred by a force along displacement. Only the aligned component contributes; a perpendicular force can turn motion without doing work.',r'W=\int\mathbf F\cdot d\mathbf r',
'A small aligned push transfers force times displacement. Divide a path into short segments, project the force on each, then sum and refine to an integral.',
'Work can be negative. A force perpendicular to every displacement does zero work even if its magnitude is large.',
'Multiplying force magnitude by any path length','Use the force component along the displacement, including its sign.','a*x',[
 t('A parallel constant force {a} N moves an object {b} m. Find work.','{a}*{b}','J'),t('A force {a} N is perpendicular to displacement {b} m. Find work.','0','J'),t('A force F(x)={a}x N acts from x=0 to x={b} m. Find work.','{a}*{b}^2/2','J')])
add('kinetic-energy','Kinetic energy from Newton law','work chain-rule',P,'Energy',
'The work needed to change speed grows with speed squared. This is why doubling speed requires four times the kinetic energy and makes stopping harder.',r'K=\tfrac12mv^2,\qquad W_{net}=\Delta K',
'Use F=m dv/dt and dx=v dt in work. The integral becomes the integral of mv dv, giving one-half mv squared at the endpoints.',
'Kinetic energy depends on reference frame and is a scalar. Relativistic speeds require a different expression.',
'Doubling speed doubles kinetic energy','Compare the square of twice the speed with the original square.','a*x^2/2',[
 t('Mass is {a} kg and speed {b} m/s. Find kinetic energy.','0.5*{a}*{b}^2','J'),t('An object has kinetic energy {a} J. Its speed doubles. Find new kinetic energy.','4*{a}','J'),t('A {a} kg object speeds from 1 to {b} m/s. Find net work.','0.5*{a}*({b}^2-1)','J')])
add('potential-energy','Potential energy & conservative forces','work integral',P,'Energy',
'Potential energy records recoverable energy of an arrangement. Choose its change so that work done by a conservative force decreases potential energy by the same amount.',r'\Delta U=-\int\mathbf F\cdot d\mathbf r,\qquad F_x=-dU/dx',
'Near Earth, gravity is downward and constant. Raising a mass by h makes gravitational work -mgh, so potential energy rises by mgh.',
'The zero of potential is arbitrary. A single-valued potential cannot represent dissipative friction over closed paths.',
'Treating the zero of potential as physically fixed','Shift every potential value by one constant and check that all work predictions remain unchanged.','a*x',[
 t('Use g=10. Raise {a} kg through {b} m. Find potential energy increase.','10*{a}*{b}','J'),t('For U(x)={a}x^2 J, find force at x={b} m.','-2*{a}*{b}','N'),t('A conservative force does {a} J work. Find potential energy change.','-{a}','J')])
add('conservation-energy','Conservation of mechanical energy','kinetic-energy potential-energy',P,'Energy',
'When only conservative forces do work, kinetic and potential energy trade places while their sum stays fixed. A falling object loses height energy at the rate it gains motion energy.',r'K_i+U_i=K_f+U_f',
'Net work equals kinetic change, while conservative work is minus potential change. Equating them makes the total change zero.',
'Friction, external work or deformation can change mechanical energy; total energy requires including those channels.',
'Conserving kinetic energy by itself during a fall','Track the sum of kinetic and potential terms between two chosen states.','a-0.5*x^2',[
 t('Total mechanical energy is {a}+{b} J and potential energy is {b} J. Find kinetic energy.','{a}','J'),t('Use g=10. From rest an object falls {a} m without drag. Find speed.','sqrt(20*{a})','m/s'),t('Initial mechanical energy is {a}+{b} J. Friction removes {b} J. Find final mechanical energy.','{a}','J')])
add('momentum','Momentum & systems','newton-2 vectors',P,'Momentum',
'Momentum combines mass and velocity into the quantity force changes. In a collection of bodies, internal forces cancel in pairs, leaving external force to change total momentum.',r'\mathbf p=m\mathbf v,\qquad\frac{d\mathbf P}{dt}=\mathbf F_{ext}',
'Add Newton equations for every body. Equal and opposite internal forces vanish from the sum, so an isolated system has constant total momentum.',
'Momentum is a vector; opposite velocities can cancel. Conservation requires negligible external impulse over the chosen interval.',
'Adding speeds instead of signed momenta','Choose an axis, give each velocity a sign, and sum mass times velocity.','a*x',[
 t('Mass {a} kg moves at {b} m/s right. Find momentum.','{a}*{b}','kg*m/s'),t('Two equal {a} kg masses move at +{b} and -{b} m/s. Find total momentum.','0','kg*m/s'),t('A {a} kg body has momentum {a}*{b} kg*m/s. Find velocity.','{b}','m/s')])
add('impulse','Impulse: a force over time','momentum integral',P,'Momentum',
'Impulse accumulates force over time and gives the resulting momentum change. Spreading a required momentum change over longer time reduces the average force.',r'\mathbf J=\int\mathbf F\,dt=\Delta\mathbf p',
'Integrate the momentum-rate form of Newton second law. The left side sums force-time strips; the right side telescopes to final minus initial momentum.',
'Peak force can differ greatly from average force. A short collision still requires checking external impulse if the system is not isolated.',
'Confusing impulse with force','Write force times time and compare the units with momentum.','a*x',[
 t('A constant {a} N force acts for {b} s. Find impulse.','{a}*{b}','N*s'),t('A {a} kg body changes velocity by {b} m/s. Find impulse.','{a}*{b}','kg*m/s'),t('An impulse is {a} N*s over {b} s. Find average force.','{a}/{b}','N')])
add('collision','Collisions & what is conserved','momentum kinetic-energy',P,'Momentum',
'Momentum can remain conserved even when kinetic energy becomes heat or deformation. A perfectly inelastic collision joins the bodies, forcing a common final velocity.',r'v_f=\frac{m_1v_1+m_2v_2}{m_1+m_2}',
'Choose both colliding bodies as the system and neglect external impulse. Equate total momentum before and after; common final velocity factors out.',
'Kinetic energy is conserved only in elastic collisions. Momentum conservation alone cannot determine both final velocities in a general collision.',
'Assuming every collision conserves kinetic energy','Compute kinetic energy before and after the common-velocity solution; missing mechanical energy changes form.','a*x/(a+2)',[
 t('A {a} kg mass moving at {b} m/s sticks to a stationary {a} kg mass. Find final speed.','{b}/2','m/s'),t('Mass {a} kg at 2 m/s sticks to {b} kg at rest. Find final velocity.','2*{a}/({a}+{b})','m/s'),t('Which claim fails in a perfectly inelastic isolated collision?','Kinetic energy is conserved',kind='error',choices=['Kinetic energy is conserved','Momentum is conserved','The joined bodies share a velocity'])])
add('circular-motion','Circular motion & inward acceleration','trig acceleration newton-2',P,'Rotation',
'Even at constant speed, a circular trajectory changes velocity because direction turns. The required acceleration points inward, toward the centre of curvature.',r'a_c=v^2/r,\qquad F_{radial}=mv^2/r',
'Two nearby velocity arrows differ by the same small angle as their radius arrows. Their difference has magnitude v times the small angle; dividing by time gives v squared over radius.',
'Centripetal describes the net radial force, not an extra force to add. Variable speed can also require tangential acceleration.',
'Adding a separate centripetal force to tension or gravity','Identify which real interaction supplies the inward resultant.','a*cos(x)',[
 t('Speed is {a} m/s on radius {b} m. Find inward acceleration.','{a}^2/{b}','m/s^2'),t('Mass {a} kg moves at {b} m/s on radius 2 m. Find radial force.','{a}*{b}^2/2','N'),t('A circular speed doubles at fixed radius. By what factor does inward acceleration change?','4')])
add('torque','Torque & rotational leverage','vectors work',P,'Rotation',
'A force turns an object most effectively when applied far from the axis and perpendicular to the lever arm. Torque records this rotational effect with a signed direction.',r'\tau=rF\sin\theta',
'A small angular turn moves the application point by a tangential distance r dtheta. Work equals tangential force times that distance, so work per angle is torque.',
'Choose an axis and sign convention. Torque and energy share dimensions but have different physical meanings.',
'Using the full lever length when force is radial','Find the perpendicular distance from the axis to the force line of action.','a*sin(x)',[
 t('A perpendicular force {a} N acts at lever arm {b} m. Find torque magnitude.','{a}*{b}','N*m'),t('A radial force {a} N acts on a lever {b} m long. Find torque.','0','N*m'),t('A tangential force of 2 N acts at radius {a} m. Find torque.','2*{a}','N*m')])
add('angular-motion','Rotational inertia & angular dynamics','torque circular-motion integral',P,'Rotation',
'Mass farther from an axis is harder to angularly accelerate because the same angular change demands more tangential speed. Rotational inertia weights mass by distance squared.',r'I=\sum m_ir_i^2,\quad\tau=I\alpha,\quad K_{rot}=\tfrac12I\omega^2',
'Each mass needs tangential acceleration r alpha and hence force m r alpha. Its torque is m r squared alpha; summing gives I alpha.',
'These scalar formulas assume rotation about a fixed principal axis. General three-dimensional rotation needs an inertia tensor.',
'Adding masses without radius-squared weighting','Compare identical masses at radius r and 2r; the latter contributes four times the inertia.','a*x^2',[
 t('A point mass {a} kg is at radius {b} m. Find its rotational inertia.','{a}*{b}^2','kg*m^2'),t('Torque is {a} N*m and inertia is {b} kg*m^2. Find angular acceleration.','{a}/{b}','rad/s^2'),t('Inertia is {a} kg*m^2 and angular speed is {b} rad/s. Find rotational kinetic energy.','{a}*{b}^2/2','J')])
add('oscillator','Oscillations & restoring forces','newton-2 differential-equations trig-derivatives',P,'Oscillations',
'A restoring force points back toward equilibrium. In an ideal spring it grows in proportion to displacement, producing an acceleration that opposes position and repeats in time.',r'm\ddot x=-kx,\quad\omega=\sqrt{k/m},\quad T=2\pi\sqrt{m/k}',
'Apply Newton second law to Hooke force. A cosine has second derivative minus its frequency squared times itself; matching coefficients fixes the frequency.',
'Hooke law is a small-deformation approximation. Damping changes amplitude and a driving force can supply energy.',
'Larger amplitude always means a longer period','For the linear equation, amplitude multiplies both sides and cancels from the frequency condition.','a*cos(x)',[
 t('Spring stiffness is {a} N/m and mass {b} kg. Find angular frequency.','sqrt({a}/{b})','rad/s'),t('Spring stiffness is {a} N/m and displacement {b} m. Find signed spring force.','-{a}*{b}','N'),t('For mass {a} kg and stiffness {b} N/m, find period.','2*pi*sqrt({a}/{b})','s')])
add('waves','Waves: a pattern that travels','oscillator functions',P,'Oscillations',
'A travelling wave shifts the same shape across space. Individual pieces of a medium may only oscillate locally while phase and energy move onward.',r'y(x,t)=A\sin(kx-\omega t),\quad v=\omega/k=f\lambda',
'Hold the phase kx-omega t constant to follow one crest. Its position changes at omega/k; one cycle travels one wavelength in one period.',
'Phase speed differs from particle speed and may differ from group speed in dispersive media.',
'The medium must travel with the crest','Track one marked point of the medium and a separate marked crest.','a*sin(x)',[
 t('Frequency is {a} Hz and wavelength {b} m. Find wave speed.','{a}*{b}','m/s'),t('A wave has period {a} s. Find frequency.','1/{a}','Hz'),t('Angular frequency is {a} rad/s and wavenumber {b} rad/m. Find phase speed.','{a}/{b}','m/s')])
add('charge','Charge & conservation','ratios signed-numbers units',P,'Electricity',
'Electric charge is a signed property that determines electric interaction. Positive and negative contributions add algebraically; an isolated system can redistribute charge without changing its total.',r'Q_{total}=\sum_i q_i',
'Count charge entering and leaving a chosen boundary. Equal internal transfers change two parts oppositely, leaving the system total unchanged.',
'Charge is quantized in elementary units; a continuous density is a large-number approximation. Neutral objects can still polarize.',
'Neutral means no charged constituents','Neutrality is equal total positive and negative charge, not absence of either.','a-x',[
 t('Charges +{a} C and -{b} C combine. Find net charge.','{a}-{b}','C'),t('An isolated system starts with {a} C. Charge moves internally. Find total final charge.','{a}','C'),t('{a} identical droplets each carry {b} C. Find total charge.','{a}*{b}','C')])
add('coulomb','Coulomb law & inverse-square spreading','charge vectors exponents',P,'Electricity',
'A point charge influences space in every direction. In three dimensions, spherical area grows as radius squared, so a spherically spreading interaction weakens with the inverse square of distance.',r'F=k_e\frac{|q_1q_2|}{r^2}',
'Coulomb law is an empirical electrostatic law consistent with spherical symmetry and flux conservation. The signs determine attraction or repulsion; the magnitude follows the inverse-square scale.',
'Use point charges or suitable spherical distributions at rest. Finite objects, materials and moving charges require additional modelling.',
'Doubling distance halves the force','Compare the area of a sphere at r and 2r; it grows by four.','a/(x+1)^2',[
 t('Use normalized electrostatic constant k=1 N*m^2/C^2. Charges {a} C and {b} C are 2 m apart. Find force magnitude.','{a}*{b}/4','N'),t('A force is {a} N at one separation. Double separation. Find new magnitude.','{a}/4','N'),t('If both charge magnitudes double at fixed distance, by what factor does force grow?','4')])
add('electric-field','Electric field: force per charge','coulomb newton-2 vectors',P,'Electricity',
'An electric field describes what force a small positive test charge would feel at each point. It separates the source arrangement from the probe used to measure it.',r'\mathbf E=\mathbf F/q_{test},\qquad\mathbf F=q\mathbf E',
'Divide the Coulomb force on a test charge by that charge. The probe factor cancels, leaving a property of the sources and the position.',
'The test charge must not significantly rearrange the source. A negative probe feels force opposite the field.',
'Field direction follows a negative probe force','Define direction with a positive test charge, then apply the sign of the actual charge.','a/(x+1)^2',[
 t('Force on a positive {a} C probe is {b} N right. Find signed field.','{b}/{a}','N/C'),t('A charge -{a} C is in field {b} N/C right. Find signed force.','-{a}*{b}','N'),t('Field is {a} N/C, charge is {b} C, mass is 2 kg. Find acceleration.','{a}*{b}/2','m/s^2')])
add('superposition','Superposition & adding fields','electric-field systems vectors',P,'Electricity',
'Each electrostatic source contributes a vector field. The field at a point is the vector sum of those contributions, so cancellation and reinforcement depend on direction.',r'\mathbf E_{total}=\sum_i\mathbf E_i',
'Electric force is linear in the source charges in this model. Divide the summed test-charge forces by the same probe charge to obtain a summed field.',
'Add components, not magnitudes. Material response may require finding induced source charges before summing.',
'Adding field magnitudes when directions oppose','Draw each source field arrow at the observation point and give components signs.','a-x',[
 t('Fields at a point are {a} N/C right and {b} N/C left. Find net signed field.','{a}-{b}','N/C'),t('Perpendicular field components are {a} and {b} N/C. Find magnitude.','sqrt({a}^2+{b}^2)','N/C'),t('Two equal opposite fields each have magnitude {a} N/C. Find resultant magnitude.','0','N/C')])
add('electric-potential','Electric potential & field work','electric-field potential-energy integral',P,'Electricity',
'Electric potential is potential energy per unit charge. It records how much work per positive charge is needed to move against the electric field between points.',r'\Delta V=-\int\mathbf E\cdot d\mathbf l,\qquad U=qV',
'Divide conservative electric work by the moved charge. Since force is qE, the charge cancels and the potential difference depends on the field path integral.',
'Potential has an arbitrary zero, while differences are observable. Time-varying magnetic fields can make electric work path-dependent.',
'Zero potential implies zero field','A potential can cross zero while still having a nonzero slope; field depends on slope.','-a*x',[
 t('Uniform field is {a} N/C right. Move {b} m right. Find potential change.','-{a}*{b}','V'),t('A {a} C charge is at potential {b} V. Find potential energy with that reference.','{a}*{b}','J'),t('Potential is V(x)={a}x volts. Find signed electric field.','-{a}','N/C')])
add('voltage','Voltage: energy per charge','electric-potential charge',P,'Circuits',
'A voltage difference says how much energy changes per unit charge moved between terminals. A battery maintains this difference by converting chemical energy as charge circulates.',r'\Delta U=q\Delta V',
'Potential is energy divided by charge. Multiplying the terminal difference by transferred charge gives transferred energy.',
'Voltage is measured between two points. It is not a substance consumed in a wire, and its sign depends on terminal order.',
'Voltage flows through a component','Charge flows; a voltage difference describes an energy change per charge between endpoints.','a*x',[
 t('Charge {a} C passes through a {b} V rise. Find energy gained.','{a}*{b}','J'),t('A source transfers {a} J per {b} C. Find voltage.','{a}/{b}','V'),t('A potential rises from {a} V to {b} V. Find final minus initial voltage.','{b}-{a}','V')])
add('current','Current & charge continuity','charge derivative',P,'Circuits',
'Current measures charge crossing a section per time. In steady state, charge cannot keep piling up at a junction, so total current entering equals total current leaving.',r'I=\frac{dQ}{dt},\qquad\sum I_{in}=\sum I_{out}',
'Apply charge conservation to a tiny region around a junction. Zero rate of stored charge forces the difference between inflow and outflow to vanish.',
'Conventional current follows positive charge flow; electrons in a metal drift oppositely. Transient charge storage requires including dQ/dt.',
'Current is used up by a resistor','Compare charge entering and leaving the resistor in steady state; energy changes, not net charge.','a*x^2',[
 t('{a} C crosses a section in {b} s. Find average current.','{a}/{b}','A'),t('Q(t)={a}t^2 C. Find current at t={b} s.','2*{a}*{b}','A'),t('At a steady junction {a}+{b} A enters and {a} A leaves one branch. Find the other outgoing current.','{b}','A')])
add('resistance','Resistance & the ohmic model','voltage current ratios',P,'Circuits',
'In an ohmic element, a larger voltage difference drives proportionally more current. Resistance is the ratio between the two, summarizing the material and geometry under fixed conditions.',r'V=IR,\qquad P=VI=I^2R',
'Ohm law is an empirical constitutive relation. Each coulomb loses V joules and I coulombs pass per second, so dissipated power is VI.',
'Resistance may change with temperature; diodes and many other devices are not ohmic. Ohm law is not a universal conservation law.',
'Every device has constant V/I','Plot current against voltage and check whether the slope stays fixed.','x/a',[
 t('A {a} ohm resistor has {b} V across it. Find current.','{b}/{a}','A'),t('Current is {a} A through {b} ohm. Find voltage.','{a}*{b}','V'),t('Current is {a} A through {b} ohm. Find dissipated power.','{a}^2*{b}','W')])
add('circuits','Circuits & conservation constraints','resistance systems conservation-energy',P,'Circuits',
'Circuit equations join charge conservation at junctions with energy conservation around loops. Components determine how a shared current or voltage divides.',r'R_{series}=\sum R_i,\qquad\frac1{R_{parallel}}=\sum\frac1{R_i}',
'Series elements share current, so their voltage drops add to I times the sum of resistances. Parallel elements share voltage, so their currents add to V times the sum of conductances.',
'Lumped steady-circuit rules assume negligible propagation delay and omitted induction. Real batteries have internal resistance.',
'Adding parallel resistances directly','Parallel gives an extra route for charge, so equivalent resistance must be smaller than either positive branch.','x/(a+2)',[
 t('Find series resistance of {a} ohm and {b} ohm.','{a}+{b}','ohm'),t('Find parallel resistance of {a} ohm and {b} ohm.','{a}*{b}/({a}+{b})','ohm'),t('A {a} V source drives two series resistors each {b} ohm. Find current.','{a}/(2*{b})','A')])
add('capacitance','Capacitance & stored field energy','voltage integral electric-field',P,'Circuits',
'A capacitor stores separated charge, and therefore field energy. Adding charge becomes harder as the voltage rises; capacitance measures how much charge is stored per volt.',r'Q=CV,\qquad U=\tfrac12CV^2',
'Move a small charge dq when the voltage is q/C. The incremental work is (q/C)dq. Integrate from zero to Q to obtain Q squared over 2C.',
'The constant-capacitance model neglects dielectric nonlinearities, leakage and breakdown. Large voltages can invalidate it physically.',
'Using QV instead of one-half QV for charging energy','The voltage rises from zero during charging; its average is half the final value for constant C.','a*x^2/2',[
 t('Capacitance is {a} F and voltage {b} V. Find stored charge.','{a}*{b}','C'),t('Capacitance is {a} F and voltage {b} V. Find stored energy.','{a}*{b}^2/2','J'),t('Stored charge is {a} C on capacitance {b} F. Find voltage.','{a}/{b}','V')])

root=pathlib.Path('content/concepts');root.mkdir(parents=True,exist_ok=True)
for idx,r in enumerate(rows):
 tasks=[]
 for j,task in enumerate(r.pop('tasks')):
  answer=task['answer'];task.update(id=r['id']+'-'+str(j+1),parameters={'a':[2,8],'b':[2,9]},difficulty=round(min(.95,.12+idx/len(rows)*.5+j*.13),2),expectedSeconds=45+j*25,hints=[r['repair'],r['mechanism'],f"Use {answer}. "+r['mechanism']],solution=r['mechanism']+' The answer follows by substitution into the relationship above.')
  if task['choices'] is None:task.pop('choices')
  else:task['choices']=[{'text':c,**({'misconception':r['id']+'-gap'} if c!=answer else {})} for c in task['choices']]
  tasks.append(task)
 domain=r['domain'];parents=r['prerequisites'];curve=r.pop('curve');law=r.pop('law');intuition=r.pop('intuition');mechanism=r.pop('mechanism');misconception=r.pop('misconception');repair=r.pop('repair')
 r.update(softPrerequisites=[],difficulty=round(.15+idx/len(rows)*.65,2),representations=['symbolic','geometric','numeric','physical'],misconceptions=[{'id':r['id']+'-gap','description':misconception,'remediation':repair}],generators=tasks,interactive={'kind':'motion' if r['id'] in ['acceleration','constant-acceleration','newton-2'] else 'curve','prompt':f"Change the parameter and connect the curve to {r['title'].lower()}. Commit a prediction before seeing the changed curve.",'prediction':f"What changes when the parameter doubles? Use the relationship in this lesson to predict the direction or scale.",'parameterLabel':'a','min':1,'max':6,'initial':2,'formula':curve,'xLabel':'t (s)' if r['id'] in ['acceleration','constant-acceleration','newton-2'] else 'x','yLabel':'position / output'},derivation=[{'expression':law,'rule':'Definition / physical model','concept':parents[0] if parents else r['id']},{'expression':law,'rule':mechanism,'concept':next((p for p in parents if p in ['derivative','integral','chain-rule','newton-2','vectors']),parents[-1] if parents else r['id'])}],explanation={'prompt':f"Explain why this works: {mechanism}",'keywords':[[w] for w in (['rate'] if any(w in r['id'] for w in ['derivative','velocity','acceleration','current']) else ['change'])]},summary=intuition,boundary=r['boundary'])
 # A concrete worked example is independently evaluated, not an invented learner trace.
 ex=tasks[0];prompt=ex['prompt'].replace('{a}','3').replace('{b}','4');expression=ex['answer'].replace('{a}','3').replace('{b}','4')
 value=eval(expression.replace('^','**'), {'__builtins__':{}}, {'sqrt':math.sqrt,'exp':math.exp,'pi':math.pi})
 r['derivation'].append({'expression':r'\text{Example: }'+format(value,'.5g')+r'\;'+ex['unit'].replace('*',r'\cdot '), 'rule':'Substitute the given values and preserve dimensions.', 'concept':r['id']})
 words=[w.lower() for w in re.findall(r'[A-Za-z]+',mechanism) if len(w)>6 and w.lower() not in ['between','because','therefore','through','original','another']]
 r['explanation']['keywords']=[[w] for w in list(dict.fromkeys(words))[:2]] or [['change']]
 links=' '.join(f"[Explore {p.replace('-',' ')}](concept:{p})." for p in parents)
 body=f"## Intuition\n\n{intuition}\n\n## Formalism\n\n$${law}$$\n\n{mechanism}\n\n{links}\n\n## Worked example\n\n{prompt}\n\nStart with the defining relationship. {mechanism} Substitute the given values: **`{expression}` = {value:.5g} {ex['unit']}**. Keep the unit through the calculation and check whether the sign and scale fit the situation.\n\n## Where it breaks\n\n{r['boundary']}\n\nA common trap is: **{misconception.lower()}**. {repair}\n"
 (root/(r['id']+'.mdx')).write_text('---\n'+json.dumps(r,indent=2)+'\n---\n\n'+body)
print(f'Authored {len(rows)} connected concepts, {len(rows)*3} generators.')
