import Cli from "./cli"

export const cli = async(args:string[]) => { 
    const c = new Cli(args)

    if(c.options.version){
        c.showVersion()
    }  

    if(c.options.help){
        c.help()
    }
    
    c.promptOptions()

    console.log(c);    
}