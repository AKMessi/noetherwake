export type Domain = 'math'|'physics';
export type Kind = 'numeric'|'symbolic'|'choice'|'ordering'|'error'|'point'|'simulation'|'proof';
export interface Misconception { id:string; description:string; remediation:string }
export interface Template { id:string; kind:Kind; prompt:string; answer:string; parameters:Record<string,[number,number]>; unit:string; difficulty:number; expectedSeconds:number; hints:[string,string,string]; solution:string; choices?:{text:string;misconception?:string}[] }
export interface InteractiveSpec {kind:'curve'|'motion';prompt:string;prediction:string;parameterLabel:string;min:number;max:number;initial:number;formula:string;xLabel:string;yLabel:string}
export interface Concept {id:string;title:string;domain:Domain;strand:string;prerequisites:string[];softPrerequisites:string[];difficulty:number;representations:string[];misconceptions:Misconception[];generators:Template[];interactive:InteractiveSpec;derivation:{expression:string;rule:string;concept:string}[];explanation:{prompt:string;keywords:string[][]};summary:string;boundary:string;html?:string}
export interface Knowledge {p:number;n:number;stability:number;last:number;observations:number;fluent:number;effortful:number;failures:number;suspicion:number;confidenceError:number}
export type ActionKind='learn'|'review'|'repair'|'mixed'|'check'|'transfer';
export interface Learner {version:1;goal:string;minutes:5|15|30;knowledge:Record<string,Knowledge>;history:Evidence[];diagnostic:string[];onboarded:boolean;theme:'system'|'dark'|'light';accessibleFont:boolean;sessions:SessionRecord[];reflection:string}
export interface Evidence {concept:string;item:string;correct:boolean;seconds:number;expectedSeconds:number;hints:number;attempts:number;confidence:number;difficulty:number;at:number;diagnostic?:boolean;guess?:number;misconception?:string}
export interface Action {concept:string;kind:ActionKind;score:number;why:string;representation:string}
export interface SessionRecord {at:number;concepts:string[];correct:number;total:number;minutes:number;reflection:string;changes:Record<string,number>}
export interface Item {id:string;concept:string;kind:Kind;prompt:string;answer:string;unit:string;difficulty:number;expectedSeconds:number;hints:[string,string,string];solution:string;choices?:{text:string;misconception?:string}[];seed:number}
export interface CheckResult {correct:boolean;feedback:string;misconception?:string;indeterminate?:boolean}
