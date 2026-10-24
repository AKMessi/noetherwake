"""Rule-annotated derivations and distractor-specific remediation for the initial curriculum."""
import json,pathlib
# Each pair is an intermediate mathematical statement and the principle justifying it.
steps={
'fractions':[(r'\frac a b=\frac{ad}{bd},\quad\frac c d=\frac{bc}{bd}','Equal scaling preserves a fraction.'),(r'\frac a b+\frac c d=\frac{ad+bc}{bd}','Count equal-sized pieces; do not add piece sizes.')],
'signed-numbers':[(r'b+(-b)=0','A number and its additive inverse cancel.'),(r'a-(-b)=a+b','Subtracting the additive inverse undoes a negative move.')],
'ratios':[(r'\frac{y_1}{x_1}=k=\frac{y_2}{x_2}','A proportional relationship preserves the output/input ratio.'),(r'y_2=kx_2','Multiply both sides by the new input.')],
'exponents':[(r'x^2x^3=(xx)(xxx)','Expand positive integer powers into their factors.'),(r'x^2x^3=x^5','Count the five joined factors.')],
'equations':[(r'ax+b=c\quad\Rightarrow\quad ax=c-b','Subtract the same b from both sides.'),(r'x=(c-b)/a,\quad a\ne0','Divide both sides by the same nonzero a.')],
'inequalities':[(r'-2x<6\quad\Rightarrow\quad 2x>-6','Reflect the number line by multiplying both sides by -1.'),(r'x>-3','Divide by positive 2, which preserves order.')],
'coordinates':[(r'\Delta x=x_2-x_1,\quad\Delta y=y_2-y_1','Form a right triangle from coordinate differences.'),(r'd^2=(\Delta x)^2+(\Delta y)^2','Pythagorean theorem gives the squared hypotenuse.')],
'slope':[(r'\Delta y=y_2-y_1,\quad\Delta x=x_2-x_1','Use changes measured in the same direction.'),(r'm=\Delta y/\Delta x,\quad\Delta x\ne0','Normalize the rise to one unit of run.')],
'linear-functions':[(r'f(x)-f(0)=mx','A constant rate accumulates m per input step.'),(r'f(x)=mx+b,\quad b=f(0)','Add the initial output back to the change.')],
'systems':[(r'(x+y)+(x-y)=s+d','Add both sides of the two valid equalities.'),(r'2x=s+d\quad\Rightarrow\quad x=(s+d)/2','The opposite y terms cancel; divide by two.')],
'quadratics':[(r'(x+h)^2=x^2+hx+hx+h^2','Distribute each side of the product.'),(r'x^2+2hx=(x+h)^2-h^2','Collect equal cross terms and isolate the original expression.')],
'functions':[(r'f(x)=x^2+3\quad\Rightarrow\quad f(2)=2^2+3','Replace every input occurrence by the same value.'),(r'f(2)=7','Evaluate the operations in their defined order.')],
'composition':[(r'g(2)=2+a','Run the inner machine first for g(x)=x+a.'),(r'f(g(2))=(2+a)^2','Feed the entire inner output into f(x)=x squared.')],
'inverse-functions':[(r'y=ax+b\quad\Rightarrow\quad y-b=ax','Undo addition while retaining the old input and output roles.'),(r'x=(y-b)/a','Undo nonzero scaling; this rule reconstructs the input.')],
'radians':[(r's=r\theta','For a fixed opening, arc length scales with radius.'),(r'\theta=s/r,\qquad s=2\pi r\Rightarrow\theta=2\pi','Normalize arc length by radius; apply the circumference for a full turn.')],
'trig':[(r'x/r=\cos\theta,\quad y/r=\sin\theta','Define sine and cosine as the normalized projections.'),(r'\cos^2\theta+\sin^2\theta=(x^2+y^2)/r^2=1','Divide the Pythagorean identity by radius squared.')],
'vectors':[(r'\Delta x=a_x+b_x,\quad\Delta y=a_y+b_y','Combine the independent axis displacements.'),(r'|\mathbf a+\mathbf b|=\sqrt{(a_x+b_x)^2+(a_y+b_y)^2}','Take the length only after summing components.')],
'dot-product':[(r'b_{\parallel}=|\mathbf b|\cos\theta','Project b onto the direction of a.'),(r'\mathbf a\cdot\mathbf b=|\mathbf a|b_{\parallel}','Multiply the aligned component by the first vector magnitude.')],
'limits':[(r'\frac{x^2-a^2}{x-a}=\frac{(x-a)(x+a)}{x-a}=x+a,\quad x\ne a','Factor and cancel only away from the excluded point.'),(r'\lim_{x\to a}\frac{x^2-a^2}{x-a}=2a','Nearby values agree with a continuous linear function.')],
'continuity':[(r'\lim_{x\to a}f(x)=L','First establish a shared nearby destination.'),(r'f(a)=L','Match the actual value to the limit to close a removable hole.')],
'derivative':[(r'\frac{(x+h)^2-x^2}{h}=2x+h,\quad h\ne0','Expand the square and cancel the common factor h.'),(r'\lim_{h\to0}(2x+h)=2x','Take the limit after simplifying the secant quotient.')],
'power-rule':[(r'(x+h)^n=x^n+nx^{n-1}h+O(h^2)','Choose the one changed factor in a product of n factors.'),(r'\lim_{h\to0}\frac{(x+h)^n-x^n}{h}=nx^{n-1}','Subtract the original value, divide by h, and let higher orders vanish.')],
'chain-rule':[(r'\frac{\Delta y}{\Delta x}=\frac{\Delta y}{\Delta u}\frac{\Delta u}{\Delta x}','Split the total conversion through an intermediate variable.'),(r'\frac{dy}{dx}=\frac{dy}{du}\frac{du}{dx}','Take compatible local-rate limits; differentiability justifies the chain rule.')],
'product-rule':[(r'\Delta(uv)=v\Delta u+u\Delta v+\Delta u\Delta v','Distribute the product of the changed factors.'),(r'(uv)\prime=vu\prime+uv\prime','Divide by the input change; the second-order corner vanishes.')],
 'trig-derivatives':[(r'(x,y)=(\cos\theta,\sin\theta)','Parametrize a point on the unit circle.'),(r'\frac{d}{d\theta}(x,y)=(-\sin\theta,\cos\theta)','A unit-speed radian tangent is the radius rotated by a quarter turn.')],
'exponential':[(r'y\prime=ky,\qquad y=y_0e^{kt}','The proportional-rate law asks for a function whose rate tracks its value.'),(r'(y_0e^{kt})\prime=ky_0e^{kt}=ky','Use the chain rule to verify the proposed trajectory.')],
'logarithms':[(r'e^{\ln x}=x,\quad x>0','Natural logarithm is the inverse of the exponential.'),(r'e^{\ln x}(\ln x)\prime=1\quad\Rightarrow\quad(\ln x)\prime=1/x','Differentiate the identity by the chain rule, then divide by x.')],
'tangent':[(r'f(a+h)-f(a)=f\prime(a)h+o(h)','The derivative captures the first-order output change.'),(r'L(x)=f(a)+f\prime(a)(x-a)','Keep the linear term and anchor the line at the known point.')],
'optimization':[(r'A(x)=x(P-x)=Px-x^2','Express the objective in one variable under the fixed-sum constraint.'),(r'A\prime=P-2x=0\Rightarrow x=P/2,\quad A\prime\prime=-2<0','A zero rate gives a candidate; negative curvature confirms a maximum.')],
'integral':[(r'\Delta Q_i\approx f(x_i)\Delta x','Local rate times a small interval is a local contribution.'),(r'Q=\lim_{\Delta x\to0}\sum_i f(x_i)\Delta x','Add the contributions and refine the partition.')],
'fundamental-theorem':[(r'\frac{A(x+h)-A(x)}h=\frac1h\int_x^{x+h}f(t)\,dt','The accumulation change over a short interval gives its average height.'),(r'\lim_{h\to0}\frac1h\int_x^{x+h}f(t)\,dt=f(x)','Continuity makes the shrinking-interval average approach the local value.')],
'substitution':[(r'u=g(x),\quad du=g\prime(x)\,dx','Carry both the new variable and the scale of its interval.'),(r'\int_a^b f(g(x))g\prime(x)\,dx=\int_{g(a)}^{g(b)}f(u)\,du','Transform the interval endpoints along with the integrand.')],
'area':[(r'\int_{-a}^a x\,dx=0','Opposite signed contributions cancel.'),(r'\int_{-a}^a|x|\,dx=2\int_0^a x\,dx=a^2','Total area adds the magnitudes of both equal triangles.')],
'differential-equations':[(r'y(t)=Ce^{kt}\quad\Rightarrow\quad y\prime=ky','Verify the rate law using the derivative of an exponential.'),(r'y(0)=C=y_0','The initial condition fixes the free constant.')],
'units':[(r'[v]=[\Delta x]/[\Delta t]=L/T','Derive speed dimensions from displacement per time.'),(r'[a]=[\Delta v]/[\Delta t]=L/T^2','A change in rate introduces another time denominator.')],
'position':[(r'x_i\mapsto x_i+c,\quad x_f\mapsto x_f+c','Shift the coordinate origin consistently for both events.'),(r'(x_f+c)-(x_i+c)=x_f-x_i','The arbitrary offset cancels from displacement.')],
'velocity':[(r'v_{avg}=\frac{x(t+h)-x(t)}h','Compare nearby positions over their shared elapsed time.'),(r'v(t)=\lim_{h\to0}v_{avg}=x\prime(t)','The instantaneous velocity is the local position slope.')],
'acceleration':[(r'a_{avg}=\frac{v(t+h)-v(t)}h','Compare nearby velocities rather than positions.'),(r'a(t)=v\prime(t)=x\prime\prime(t)','Take the instantaneous limit and differentiate position twice.')],
'constant-acceleration':[(r'v(t)-v_0=\int_0^t a\,ds=at','Integrate the constant acceleration using the initial velocity.'),(r'x(t)-x_0=\int_0^t(v_0+as)\,ds=v_0t+\tfrac12at^2','Integrate the resulting linear velocity.')],
'free-fall':[(r'\sum F_y=-mg=ma_y','Combine gravitational force with the constant-mass Newton law.'),(r'a_y=-g,\quad v_y=v_{0y}-gt','Cancel nonzero mass and integrate constant acceleration.')],
'projectile':[(r'a_x=0,\quad a_y=-g','Gravity alone acts vertically in this ideal model.'),(r'x=v_0\cos\theta\,t,\quad y=v_0\sin\theta\,t-gt^2/2','Resolve the initial velocity, then integrate the two component equations.')],
'newton-1':[(r'\frac{d\mathbf p}{dt}=0\quad\Rightarrow\quad\mathbf p=\mathbf p_0','A force-free body has constant momentum in an inertial frame.'),(r'\mathbf v=\mathbf p_0/m=\text{constant}','For constant mass, momentum constancy implies velocity constancy.')],
'newton-2':[(r'\mathbf F_{net}=d\mathbf p/dt,\quad\mathbf p=m\mathbf v','Start from the momentum-rate form of the law.'),(r'\mathbf F_{net}=m\frac{d\mathbf v}{dt}=m\mathbf a','With fixed mass, take it outside the derivative.')],
'free-body':[(r'N-mg=ma_y','Isolate the body and assign upward positive.'),(r'N=m(g+a_y)','Solve the vertical force balance; only zero vertical acceleration gives N=mg.')],
'friction':[(r'F_{push}-f_s=0\Rightarrow f_s=F_{push}','No slip requires the actual static friction to balance the push.'),(r'F_{push}\le\mu_sN','Check the required friction against its available maximum.')],
'work':[(r'\Delta W_i\approx F_{\parallel,i}\Delta s_i','Only force along a displacement transfers work.'),(r'W=\lim\sum_i\mathbf F_i\cdot\Delta\mathbf r_i=\int\mathbf F\cdot d\mathbf r','Sum projected contributions and refine the path.')],
'kinetic-energy':[(r'W_{net}=\int m\frac{dv}{dt}v\,dt=\int mv\,dv','Substitute Newton law and dx=v dt into the work integral.'),(r'W_{net}=\tfrac12mv_f^2-\tfrac12mv_i^2=\Delta K','Integrate the velocity variable between the two speeds.')],
'potential-energy':[(r'\Delta U=-W_g=-\int_0^h(-mg)\,dy','Define potential change as minus conservative-force work.'),(r'\Delta U=mgh','Integrate constant near-surface gravity with upward displacement.')],
'conservation-energy':[(r'\Delta K=W_{net},\quad W_{conservative}=-\Delta U','Combine the work-energy theorem and potential definition.'),(r'\Delta K+\Delta U=0\quad\Rightarrow\quad K_i+U_i=K_f+U_f','With only conservative work, total mechanical energy is unchanged.')],
'momentum':[(r'\frac{d\mathbf P}{dt}=\sum\mathbf F_{ext}+\sum\mathbf F_{internal}','Add the momentum-rate equations for every system body.'),(r'\sum\mathbf F_{internal}=0\Rightarrow\dot{\mathbf P}=\mathbf F_{ext}','Internal third-law pairs cancel from the system sum.')],
'impulse':[(r'\int_{t_i}^{t_f}\mathbf F\,dt=\int_{t_i}^{t_f}\frac{d\mathbf p}{dt}\,dt','Accumulate the momentum-rate law over the interaction time.'),(r'\mathbf J=\mathbf p_f-\mathbf p_i','The integral of a derivative is its endpoint difference.')],
'collision':[(r'm_1v_1+m_2v_2=m_1v_f+m_2v_f','Conserve total momentum when the bodies stick and external impulse is negligible.'),(r'v_f=\frac{m_1v_1+m_2v_2}{m_1+m_2}','Factor the common velocity and divide by total mass.')],
'circular-motion':[(r'|\Delta\mathbf v|/v\approx\Delta s/r','Radius and velocity arrows turn through the same small angle.'),(r'a=\lim_{\Delta t\to0}\frac{v\Delta s}{r\Delta t}=v^2/r','Divide the velocity change by time and use ds/dt=v.')],
'torque':[(r'dW=F_{tangent}\,r\,d\theta','A short angular turn moves the application point tangentially by r dtheta.'),(r'\tau=\frac{dW}{d\theta}=rF_{tangent}=rF\sin\theta','Torque is work per angle; retain the perpendicular force component.')],
'angular-motion':[(r'\tau_i=r_i(m_ir_i\alpha)=m_ir_i^2\alpha','Apply the tangential Newton law to each point mass.'),(r'\tau=\left(\sum_i m_ir_i^2\right)\alpha=I\alpha','Sum all torques about the fixed axis.')],
'oscillator':[(r'm\ddot x=-kx,\quad x=A\cos(\omega t+\phi)','Combine spring force with Newton law and propose a sinusoid.'),(r'-m\omega^2x=-kx\Rightarrow\omega=\sqrt{k/m}','Substitute its second derivative and match the position coefficients.')],
'waves':[(r'kx-\omega t=\text{constant}','Follow a fixed phase such as one crest.'),(r'k\frac{dx}{dt}-\omega=0\Rightarrow v=\omega/k=f\lambda','Differentiate fixed phase and use k=2pi/lambda, omega=2pi f.')],
'charge':[(r'\Delta Q_1=-\Delta Q_2','An internal charge transfer changes the two parts oppositely.'),(r'\Delta Q_{total}=\Delta Q_1+\Delta Q_2=0','Add the changes to recover isolated-system charge conservation.')],
'coulomb':[(r'4\pi r^2E=\frac{q}{\varepsilon_0}','Gauss electrostatic flux law plus spherical symmetry fixes the inverse-square field.'),(r'E=\frac{q}{4\pi\varepsilon_0r^2},\quad|F|=|q_{test}E|','Divide by sphere area and multiply by the test charge. Flux law is a physical premise, not derived from geometry alone.')],
'electric-field':[(r'\mathbf F=\frac{k_eq_{source}q_{test}}{r^2}\hat{\mathbf r}','Apply the signed Coulomb interaction to a test charge.'),(r'\mathbf E=\mathbf F/q_{test}=\frac{k_eq_{source}}{r^2}\hat{\mathbf r}','Divide out the probe dependence to define a source field.')],
'superposition':[(r'\mathbf F_{total}=q_{test}\mathbf E_1+q_{test}\mathbf E_2','Each source contributes independently to the probe force.'),(r'\mathbf E_{total}=\mathbf F_{total}/q_{test}=\mathbf E_1+\mathbf E_2','Divide the total force by the common nonzero probe charge.')],
'electric-potential':[(r'\Delta U=-\int q\mathbf E\cdot d\mathbf l','Electric potential energy changes by minus electric-force work.'),(r'\Delta V=\Delta U/q=-\int\mathbf E\cdot d\mathbf l','Normalize the energy change per transported charge.')],
'voltage':[(r'\Delta V=\Delta U/q','Voltage difference is potential energy difference per charge.'),(r'\Delta U=q\Delta V','Reconstruct energy transfer for a specified signed charge.')],
'current':[(r'\frac{dQ_{stored}}{dt}=\sum I_{in}-\sum I_{out}','Conservation balances charge accumulation against current flow.'),(r'dQ_{stored}/dt=0\Rightarrow\sum I_{in}=\sum I_{out}','At steady state, no net charge accumulates at the junction.')],
'resistance':[(r'P=\frac{dU}{dt}=V\frac{dQ}{dt}=VI','Energy per charge times charge per time is power.'),(r'V=IR\Rightarrow P=I^2R','Insert the empirical ohmic relation at fixed conditions.')],
'circuits':[(r'V=IR_1+IR_2=I(R_1+R_2)','Series elements share current; loop energy conservation adds their voltage drops.'),(r'I=V/R_1+V/R_2\Rightarrow1/R_{eq}=1/R_1+1/R_2','Parallel elements share voltage; junction charge conservation adds their currents.')],
'capacitance':[(r'dW=V\,dq=\frac qC\,dq','The charging voltage rises with accumulated charge for constant C.'),(r'U=\int_0^Q\frac qC\,dq=\frac{Q^2}{2C}=\tfrac12CV^2','Integrate the incremental charging work and substitute Q=CV.')],
}
# One named cause for each wrong option, rather than a generic error bucket.
distractors={
'inequalities':{'x < -3':('negative-scaling','A negative scaling reverses order','Reflect both test values on the number line before reading the order.'),'x = -3':('boundary-only','An inequality is a region, not just its boundary','Test x=0 and x=-4 in the original inequality to identify the permitted side.')},
'continuity':{'Yes':('corner-smoothness','Continuity confused with differentiability','The graph of abs(x) has no jump but its slopes disagree at zero.'),'Only for positive values':('sign-smoothness','Input sign mistaken for smoothness','Shift an absolute-value corner to x=2; a positive input still need not have a derivative.')},
'fundamental-theorem':{'a positive slope':('monotonicity','Increasing confused with continuous','A positive slope is unnecessary; continuous decreasing rates also have matching shrinking averages.'),'an arbitrary constant':('constant-average','Antiderivative constants confused with local averages','A constant shifts an accumulated function but does not justify the limit of its average height.')},
'collision':{'Momentum is conserved':('isolated-momentum','Dissipation confused with momentum loss','Internal deformation changes energy form; with negligible external impulse, total signed momentum remains fixed.'),'The joined bodies share a velocity':('shared-velocity','Sticking confused with separate final motions','A perfectly inelastic model binds both bodies, so their final velocity is common.')}
}
for file in pathlib.Path('content/concepts').glob('*.mdx'):
 text=file.read_text();_,front,body=text.split('---',2);c=json.loads(front);id=c['id'];parents=c['prerequisites']
 c['derivation']=[{'expression':expr,'rule':rule,'concept':parents[-1] if parents else id} for expr,rule in steps[id]]
 for template in c['generators']:
  for option in template.get('choices',[]):
   if option['text']==template['answer']:continue
   short,description,remediation=distractors[id][option['text']];mid=id+'-'+short;option['misconception']=mid
   if not any(m['id']==mid for m in c['misconceptions']):c['misconceptions'].append({'id':mid,'description':description,'remediation':remediation})
 if id in ['constant-acceleration','newton-2','acceleration']:
  c['interactive']['formula']='x+a*x^2/2';c['interactive']['yLabel']='position x (m)'
 # Explain which quantities a general relation panel actually varies.
 c['interactive']['prompt']=f"Vary a in f(x)={c['interactive']['formula']}. The solid curve will show the new output; the dashed curve retains a=2. Link the changed scale or shape to the relationship in this lesson."
 file.write_text('---\n'+json.dumps(c,indent=2)+'\n---'+body)
print(f'Refined {len(steps)} derivations; distractors now have distinct named causes.')
