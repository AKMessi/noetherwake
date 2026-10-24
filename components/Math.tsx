import katex from 'katex';
export default function MathText({value,display=false}:{value:string;display?:boolean}){return <span className={display?'math-display':''} dangerouslySetInnerHTML={{__html:katex.renderToString(value,{throwOnError:false,displayMode:display,output:'htmlAndMathml'})}}/>;}
