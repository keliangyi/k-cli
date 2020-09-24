import Cli from "./cli"

export const cli = async(args:string[]) => { 
    const c = new Cli(args)    
    await c.promptOptions()
    await c.createProject()
    console.log(c);    
}
