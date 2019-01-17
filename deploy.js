const { spawn } = require('child_process')
const argv = require('yargs')
  .usage('Usage: $0 --stage dev --aws-access-key-id your-acess-id --aws-secret-key your-secret-key')
  .example('$0 --stage dev --aws-access-key-id {AWS_ACCESS_KEY} --aws-secret-key {AWS_SECRET_KEY}', 'Deploy to the specified stage with the given credentials')
  .describe('stage', 'The stage to deploy to')
  .alias('s', 'stage')
  .describe('aws-access-key-id', 'The access key ID for your IAM account')
  .describe('aws-secret-key', 'The secret key for your IAM account')
  .demandOption(['aws-access-key-id', 'aws-secret-key', 'stage'])
  .help('h')
  .alias('h', 'help').argv

function deploy() {
  const awsVars = {
    AWS_ACCESS_KEY_ID: argv.awsAccessKeyId,
    AWS_SECRET_ACCESS_KEY: argv.awsSecretKey
  }
  const env = Object.assign({}, process.env, awsVars)
  const slsArgs = ['deploy', '--stage', argv.stage]

  return spawn('./node_modules/.bin/serverless', slsArgs, {
    cwd: undefined,
    env
  })
}

const sls = deploy()
sls.stdout.on('data', data => console.log(data.toString()))
sls.stderr.on('data', data => console.error(data.toString()))
sls.on('close', code => process.exit(code))
