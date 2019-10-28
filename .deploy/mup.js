module.exports = {
  servers: {
    one: {
      host: '104.248.52.121',
      username: 'root',
      pem: '~/.ssh/id_rsa'
    }
  },

  app: {
    name: 'spacefrigates',
    path: '../',

    servers: {
      one: {},
    },

    buildOptions: {
      serverOnly: true,
    },

    env: {
      ROOT_URL: 'http://104.248.52.121',
    },

    docker: {
      image: 'abernix/meteord:node-8.4.0-base',
    },

    enableUploadProgressBar: true
  },

};
