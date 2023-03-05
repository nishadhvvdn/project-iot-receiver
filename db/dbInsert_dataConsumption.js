function insertInToMySQL(objToInsert, table, callback) {
    configPara.getConnection(function (err, connection) {
        if (err) {
            console.log("Error mysql get connection-----" + err);
                // connection.release();
                callback(err, null);

        } else {
            connection.beginTransaction(function (err) {
                if (err) {
                    console.log("Error in mysql Insert beginTransaction" + err)         //Transaction Error (Rollback and release connection)
                    connection.rollback(function () {
                        // con.release();
                        callback(err, null);
                        //Failure
                    });
                } else {
                    connection.query('INSERT INTO ' + table + ' SET ?', objToInsert, function (error, results, fields) {
                        if (error) {
                            console.log('Error insert mysql query' + error);
                            connection.rollback(function () {
                                // con.release();
                                callback(error, null);
                                //Failure
                            });
                        } else {
                            connection.commit(function (err) {
                                if (err) {
                                    console.log("Error in mysql commit" + err)
                                    connection.rollback(function () {
                                        // con.release();
                                        callback(err, null);
                                        //Failure
                                    });
                                } else {
                                    // console.log(query.sql);
                                    console.log("Mysql insert Success");
                                    // con.release();
                                    callback(null, true);
                                }
                            })

                        }
                    })

                }
            })

        }
    })
}