
function create(user, callback) {
    const neo4j = require('neo4j-driver@4.3.3');
    
    var driver = neo4j.driver(
      'neo4j+s://d9478053.databases.neo4j.io',
      neo4j.auth.basic('neo4j', 'rJDuc2LXmKdObWPVMu09uUWedF0-tyDFC1RQynX8Uhc')
    );
    
      var session = driver.session();
  
    
  
    bcrypt.hash(user.password, 10, function(err, hash) {
      if (err) return callback(err);
      const insert = {
        password: hash,
        email: user.email
      };
      
      const query = 'create (n:Cliente{ email:'+user.email +', password:'+hash+'})  return n';
      
       session
      .run(query)
      .subscribe({
          onKeys: keys => {
            console.log("done",keys);
          },
          onNext: record => {
            console.log("done",record._fields[0]);
            callback(null);
          },
          onCompleted: () => {
              session.close();
          },
          onError: error => {
            callback(err);
          }
        });
    });
  }


function getByEmail(email, callback) {
    const neo4j = require('neo4j-driver@4.3.3');
    
    var driver = neo4j.driver(
      'neo4j+s://d9478053.databases.neo4j.io',
      neo4j.auth.basic('neo4j', 'rJDuc2LXmKdObWPVMu09uUWedF0-tyDFC1RQynX8Uhc')
    );
    
      var session = driver.session();
    
    const query = 'match (n:Cliente{ email:'+email+'})  return n';
      
       session
      .run(query)
      .subscribe({
          onKeys: keys => {
            console.log("done",keys);
          },
          onNext: record => {
            console.log("done",record._fields[0]);
            if(record._fields.length === 0){
              return callback(null);
             }
            else{
                callback(null, {
                user_id: user.id.toString(),
                nickname: user.nickname,
                email: user.email
              });
            
            }
            
            
          },
          onCompleted: () => {
              session.close();
          },
          onError: error => {
            return callback(err );
          }
        });
  
     
  }
  