
import arg from 'arg'
import ncp from 'ncp'
import execa from 'execa'
import chalk from 'chalk'
import inquirer from 'inquirer'
import Listr from 'listr'
import fs from 'fs'
import { join } from 'path'
import { promisify } from 'util'
import { projectInstall } from 'pkg-install'

interface Ioptions {
    name:string
    help:boolean
    version:boolean
    git:boolean
    typescript:boolean
    runInstall:boolean
    template ?:string
}

const access = promisify(fs.access)
const copyDir = promisify(ncp)

class Cli { 

    version : string
    options!: Ioptions    
    projectPath !: string

    #argv:{[propName:string]:any} = {
        '--name':String,
        '--help':Boolean,
        '--version':Boolean,
        '--git':Boolean,
        '--typescript':Boolean,        
        '--install':Boolean,        

        '-n':'--name',
        '-v':'--version',
        '-h':'--help',
        '-g':'--git',
        '-t':'--typescript',
        '-i':'--install'
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
            typescript:args["--typescript"] ?? true,
            help:args["--help"] ?? false,
            version:args["--version"] ?? false,
            git:args["--git"] ?? false,        
            runInstall:args["--install"] ?? false,        
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
            -t, --typescript                是否使用typescript，默认true，设置成false也没有用
            -g, --git                       git init
            -i, --install                   npm install
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
        if(!this.options.name){
            console.error("%s 无效的项目名，请重新输入", chalk.red.bold('ERROR'))
            return
        }

        this.projectPath = join(process.cwd(),this.options.name)

        const templateDir = join(this.#templatesPath,this.options.template as string) 

        try {
            await access(templateDir,fs.constants.R_OK)
        } catch (error) {
            console.error(error,"%s 无效的templae名称", chalk.red.bold('ERROR'))
            process.exit(1)
        }   

        const tasks = new Listr([
            {
                title:"copy template",
                task:() => this.copyTemplateFile(templateDir)
            },
            {
                title:"init git",
                task:() => this.initGit(),
                enabled:() => this.options.git
            },
            {
                title:"install package",
                task:() => this.installPackage(),
                enabled: () => this.options?.template !== 'python-flask',
                skip: () => !this.options.runInstall && '输入 --install 安装依赖'
            }
        ])    
        await tasks.run()    
        return true    
    }

    copyTemplateFile (templateDir:string) {        
        return copyDir(templateDir,this.projectPath,{
            clobber:false
        })
    }

    async initGit () {
        const res = await execa('git',['init'],{
            cwd:this.projectPath 
        }) 
        
        if(res.failed){
            return Promise.reject(new Error('init git 失败'))
        }
    }

    async installPackage () {
        return projectInstall({
            cwd:this.projectPath
        })
    }

}

export default Cli
