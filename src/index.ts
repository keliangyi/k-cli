import Cli from "./cli"

export const cli = async(args:string[]) => { 
    const c = new Cli(args)

    if(c.options.version){
        c.showVersion()
    }  

    if(c.options.help){
        c.help()
    }
    
    await c.promptOptions()
    await c.createProject()
    console.log(c);    
}
