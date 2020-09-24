
export interface IGitOPtions {
    
}

class GitPush {

    argv:string[]
    options !: IGitOPtions 

    constructor(args:string[]){
         
        this.argv = args
        this.init()
    }

    async init () {

        console.log(this.argv);
        
        process.exit(1)
    }

}

export default GitPush