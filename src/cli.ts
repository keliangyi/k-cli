
import arg from 'arg'
import chalk from 'chalk'
import inquirer from 'inquirer'
import fs from 'fs'
import { join } from 'path'

interface Ioptions {
    name:string
    help:boolean
    version:boolean
    git:boolean
    typescript:boolean
    template ?:string
}


class Cli { 

    options!: Ioptions 
    version : string

    #argv:{[propName:string]:any} = {
        '--name':String,
        '--help':Boolean,
        '--version':Boolean,
        '--git':Boolean,
        '--typescript':Boolean,        

        '-n':'--name',
        '-v':'--version',
        '-h':'--help',
        '-g':'--git',
        '-t':'--typescript'
    }

    constructor(args:string[]){
        this.version = require('../package.json').version
        this.parseArgsIntoOptions(args)
    }
   
    parseArgsIntoOptions(rawArgs:string[]){
        const args = arg(this.#argv,{ argv:rawArgs.splice(2) })        
        this.options =  {
            name:args._[0] ?? args["--name"],
            typescript:args["--typescript"] ?? false,
            help:args["--help"] ?? false,
            version:args["--version"] ?? false,
            git:args["--git"] ?? false,        
        }
    }

    
    showVersion () {
        console.log(chalk`Version： {bold.green ${this.version} } `)
        process.exit(1)
    }
    
    help () {
        console.log(chalk.cyan`
        Version  ${this.version}
        Syntax   k-cli <name> [...options]
        Examples k-cli 
                    k-cli my-app -t
                    k-cli -n my-app -t
        Options:
            -h, --help                      帮助，打印出这一段信息
            -v, --version                   版本号
            -n, --name                      项目的名称
            -t, --typescript                是否使用typescript
            -g, --git                       git init
        `)
        process.exit(1)
    }

    async promptOptions () {
        const questions = this.setQuestions()
        const answers:Ioptions = await inquirer.prompt(questions)    
        this.options = {
            ...this.options,
            name:this.options.name ?? answers.name,
            template:answers.template
        }
    }

    setQuestions ():inquirer.QuestionCollection<any>[]  {
        const questions:inquirer.QuestionCollection<any>[] = []
        if(!this.options.name){
            questions.push({
                type:'input',
                name:"name",
                message:"请输入项目的名称",            
            })
        }        
        const templates =  fs.readdirSync(join(process.cwd(),'templates')) 
        questions.push({
            name:"template",
            type:'rawlist',
            choices:templates
        })
        return questions
    }

    createProject () {
          
    }

}

export default Cli
