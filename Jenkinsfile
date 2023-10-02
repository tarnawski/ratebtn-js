pipeline {
    agent any
	stages {
		stage('Checkout') {
			steps {
				checkout scm
			}
		}
		stage('Deploy to production') {
			when { branch 'master' }
			steps {
				sh 'npm install'
				sh 'node_modules/gulp/bin/gulp.js'
				sh 'tar -czvf artifact.tar dist images scripts styles index.html'
				sh 'ansible-playbook ansible/deploy.yml'
			}
		}
	}
}