import arg from 'arg'
import inquirer from 'inquirer'

import { createProject } from './main'

const parseArgsIntoOptions = (rawargs:string[]) => {
    const args = arg(
        {
            '--yes':Boolean,
            '--git':Boolean,          
            '--install':Boolean,
            '-g':'--git',
            '-i':'--install',
            '-y':'--yes',
        },
        {
            argv:rawargs.slice(2)
        }
    )
    console.log(args);
    return {
        skipPrompts:args['--yes'] || false,
        git:args['--git'] || false,
        template:args._[0],
        runInstall:args['--install'] || false
    }
}


const promptOptions = async (options:any) => {
    const defaultTemplate = "JavaScript"
    if(options.skipPrompts){
        return {
            ...options,
            template: options.template || defaultTemplate
        }
    }

    const questions = []

    if(!options.template){
        questions.push({
            type:"list",
            name:"template",
            message:"请选择一个template",
            choices:[ 'JavaScript', 'TypeScript' ],
            default:defaultTemplate
        })
    }

    if(!options.git){
        questions.push({
            type:"confirm",
            name:"git",
            message:"初始化git?",            
            default:false
        })
    }

    const answers = await inquirer.prompt(questions)
    
    return {
        ...options,
        template:options.template || answers.template,
        git:options.git || answers.git
    }
}

export async function cli(args:string[]) {
    let options = parseArgsIntoOptions(args)
    options = await promptOptions(options)
    await createProject(options)
}