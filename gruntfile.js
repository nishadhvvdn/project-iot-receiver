module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-jshint');	
	grunt.loadNpmTasks('grunt-forever');
    grunt.loadNpmTasks('grunt-contrib-watch');	
	grunt.initConfig({
		forever: {
		  server: {
			options: {
			  index: 'IoTReceiverserver.js',
			  logDir: 'logs'
			}
		  }
		},
		jshint: {
		  files: ['IoTReceiverserver.js'],
		  options: {
			globals: {
			  jQuery: true
			}
		  }
		},
        //specifying the settings for watch
        watch: {
            scripts: {
                files: ['**'],
                tasks: ['restartserver'],
                options: {
                },
            },
        },		
	});
	
    grunt.registerTask('default', function (target) {
        grunt.task.run(['forever:server:start']);
    });
	
    grunt.registerTask('jshint', function (target) {
        grunt.task.run(['']);
    });	
    
    grunt.registerTask('startserver', function (target) {
        grunt.task.run(['forever:server:start']);
    });
    grunt.registerTask('restartserver', function (target) {
        grunt.task.run(['forever:server:restart']);
    });
    
    grunt.registerTask('stopserver', function (target) {
        grunt.task.run(['forever:server:stop']);
    });
    
    grunt.registerTask('startserverforcefully', function (target) {
        grunt.task.run(['forever:server:stop', 'forever:server:start']);
    });
};