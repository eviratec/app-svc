/** 
 * Copyright (c) 2017 Callan Peter Milne
 * 
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above 
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 * OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 * PERFORMANCE OF THIS SOFTWARE.
 */
'use strict';

const knex = require('knex')({  
  client: 'mysql',
  connection: {
    socketPath: '/run/mysqld/mysqld.sock',
    user: process.env.EV_MYSQL_USER,
    password: process.env.EV_MYSQL_PASS,
    database: process.env.EV_MYSQL_DB,
  }
});

const bookshelf = require('bookshelf')(knex);

const Client = bookshelf.Model.extend({
  tableName: 'clients',
});

const AppClient = bookshelf.Model.extend({
  tableName: 'app_clients',
  client: function () {
    return this.hasOne(Client, 'id', 'client_id');
  },
});

const App = bookshelf.Model.extend({
  tableName: 'apps',
  clients: function () {
    return this.hasMany(AppClient);
  },
});




const Permission = bookshelf.Model.extend({
  tableName: 'permissions',
});

const AuthorizationPermission = bookshelf.Model.extend({
  tableName: 'authorization_permissions',
  permission: function () {
    return this.One(Permission);
  },
});

const Authorization = bookshelf.Model.extend({
  tableName: 'authorizations',
  permissions: function () {
    return this.hasMany(AuthorizationPermission);
  },
});


module.exports = {
  fetchOneById: function (app_id) {
    return new Promise((resolve, reject) => {

      let q = {};
      
      q.where = { id: app_id };

      App
        .query(q)
        .fetch({withRelated: ['clients', 'clients.client']})
        .then((app) => {

          if (null === app) {
            reject(new Error('No apps'));
            return;
          }

          resolve(app);

        })
        .catch(err => {
          reject(err);
        });
    });

  },
  fetchOneByClientUrl: function (client_url) {
    return new Promise((resolve, reject) => {

      let q = {};
      
      q.where = { url: client_url };

      Client
        .query(q)
        .fetch()
        .then((client) => {

          if (null === client) {
            reject(new Error('No clients'));
            return;
          }

          resolve(client);

        })
        .catch(err => {
          reject(err);
        });

    });

  },
};
