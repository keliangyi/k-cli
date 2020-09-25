import arg from "arg"
import execa from "execa"
import inquirer from "inquirer"
import Listr from "listr"

export interface IGitOPtions {
    remote: string
    branch: string
    commit: string
}

// git 四连
class GitPush {

    argv: arg.Result<{ [propName: string]: any }>
    options !: IGitOPtions

    #maxTypeLen:number = Object.keys(GitPush.commitTypes).reduce((acc,cur) => (acc.length > cur.length) ? acc : cur ).length

    static commitTypes = {
        feat: {
            "description": "A new feature",
            "emoji": "🎯",
            "value": "feat"
        },
        fix: {
            "description": "A bug fix",
            "emoji": "🐛",
            "value": "fix"
        },
        perf: {
            "description": "A code change that improves performance",
            "emoji": "⚡️",
            "value": "perf"
        },
        style: {
            "description": "Markup, white-space, formatting, missing semi-colons...",
            "emoji": "💄",
            "value": "style"
        },
        release: {
            "description": "Create a release commit",
            "emoji": "🏹",
            "value": "release"
        },
        test: {
            "description": "Adding missing tests",
            "emoji": "💍",
            "value": "test"
        },
        chore: {
            "description": "Build process or auxiliary tool changes",
            "emoji": "🧰",
            "value": "chore"
        },
        ci: {
            "description": "CI related changes",
            "emoji": "🎡",
            "value": "ci"
        },
        docs: {
            "description": "Documentation only changes",
            "emoji": "✏️",
            "value": "docs"
        },       
        refactor: {
            "description": "A code change that neither fixes a bug or adds a feature",
            "emoji": "💡",
            "value": "refactor"
        }, 
    }


    constructor(args: arg.Result<{ [propName: string]: any }>) {
        this.argv = args
     
        this.initGit()
    }

    async initGit() {
        this.options = this.parseOptions()
        await this.commit()
        await this.runCommand()
        
        process.exit(1)
    }

    parseOptions(): IGitOPtions {
        const { argv } = this
        return {
            remote: argv['--remote'] ?? 'origin',
            branch: argv['--branch'] ?? 'master',
            commit: ''
        }
    }

    async commit() {
        const questions:inquirer.QuestionCollection<any>[] = [
            {
                name:"commit-type",
                type: 'rawlist',
                choices: Object.entries(GitPush.commitTypes).map(([ key, val ])=>({ name: `${val.emoji} ${val.value.padEnd(this.#maxTypeLen,)}  ${val.description}`, value:key }))
            },
            {
                name:"commit-message",                
                type:'input',
                validate:(input) => {                   
                    return !!input
                }
            }
        ]
        const answers:{[ propName:string ]:string} = await inquirer.prompt(questions) 
        const commitType = GitPush.commitTypes[(answers['commit-type'] as keyof typeof GitPush.commitTypes )]
        this.options.commit = `${ commitType.value }:${ commitType.emoji } ${answers['commit-message']}` 
    }

    async runCommand () {
        const { commit, branch, remote } = this.options
        const tasks = new Listr([
            {
                title:"git pull",
                task:() => this.gitCommand(['pull']),
            },
            {
                title:"git add",
                task:() => this.gitCommand([ 'add', '.' ]),
            },
            {
                title:"git commit",
                task:() => this.gitCommand([ 'commit', '-m', commit ]),
            },
            {
                title:"git push",
                task:() => this.gitCommand([ 'push', remote, branch ]),
            },
            
        ])    
        await tasks.run()    
        return true  
    }

    async gitCommand (options:string[]) {
        try {
            const res = await execa('git',options) 
            if(res.failed){
                return Promise.reject(new Error('execa failed'))
            }    
        } catch (error) {
            return Promise.reject(new Error(error))
        }        
    }

}

export default GitPush