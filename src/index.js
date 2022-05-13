const path = require('path')
const Colorette = require('colorette')
const { NodeSSH } = require('node-ssh')

class FileUploadWebpackPlugin {
    constructor(options) {
        this.ssh = new NodeSSH()
        this.color = Colorette
        this.options = options
    }
    apply(compiler) {
        compiler.hooks.afterEmit.tap('FileUploadWebpackPlugin', (compilation) => {
            const outputPath = compilation.outputOptions.path
            const port = this.options.port || '22'
            const sshCommand = `ssh ${this.options.username}@${this.options.host} -p ${port}`
            // ssh connect
            this.ssh.connect({
                host: this.options.host,
                port,
                username: this.options.username,
                privateKey: this.options.privateKey,
            }).then(() => {
                console.log(`--> ${this.color.green(sshCommand)} login success`);
                console.log(`--> Uploading file...`)
                // ssh putDirectory
                this.ssh.putDirectory(outputPath, this.options.remotePath, {
                    recursive: true,
                    concurrency: this.options.concurrency || 10,
                    tick: (localPath, remotePath, error) => {
                        if (error) {
                            console.log(`${this.color.red('X')} uploaded file ${this.color.red(path.basename(localPath))}`);
                        } else {
                            console.log(`${this.color.green('✔')} uploaded file ${this.color.green(path.basename(localPath))}`);
                        }
                    }
                }).then(status => {
                    console.log('File uploaded', status ? this.color.green('successfully') : this.color.red('failed'))
                    this.ssh.dispose()
                }).catch(err => {
                    console.log(`--> ${sshCommand} put directory fail:`, err)
                    this.ssh.dispose()
                })
            }).catch(err => {
                console.log(`--> ${sshCommand} login fail:`, err)
                this.ssh.dispose()
            })
        })
    }
}

module.exports = FileUploadWebpackPlugin