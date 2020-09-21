
import arg from 'arg'
import chalk from 'chalk'
import inquirer from 'inquirer'
import Listr from 'listr'
import fs from 'fs'
import { join } from 'path'
import { promisify } from 'util'

interface Ioptions {
    name:string
    help:boolean
    version:boolean
    git:boolean
    typescript:boolean
    template ?:string
}

const access = promisify(fs.access)
const copyFile = promisify(fs.copyFile)

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
    //@ts-ignore
    #templatesPath = join(new URL(import.meta.url).pathname.slice(1),'../../templates')

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
                message:"请输入项目的名称:",            
            })
        }     
       
        const templates = fs.readdirSync(this.#templatesPath) 
        
        questions.push({           
            type:'rawlist',
            name:"template",
            message:"请选择模板:",
            choices:templates
        })

        if(!this.options.git){
            questions.push({
                type:'confirm',
                name:"git",
                message:"是否初始化git:",            
            })
        }        

        return questions
    }

    async createProject () {
        const templateDir = join(this.#templatesPath,this.options.template as string) 
        try {
            await access(templateDir,fs.constants.R_OK)
        } catch (error) {
            console.error(error,"%s 无效的templae 名称", chalk.red.bold('ERROR'))
            process.exit(1)
        }   
        const tasks = new Listr([
            {
                title:"复制模板文件",
                task:() => this.copyTemplateFile(templateDir)
            },
        ])            
    }

    copyTemplateFile (templateDir:string) {
        return copyFile(templateDir,process.cwd(),)
    }

}

export default Cli
