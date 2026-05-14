<?php
 
namespace App\Database\Migrations;
 
use CodeIgniter\Database\Migration;
 
class CreateUsersTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'             => ['type'=>'INT','unsigned'=>true,'auto_increment'=>true],
            'nom'            => ['type'=>'VARCHAR','constraint'=>100],
            'prenom'         => ['type'=>'VARCHAR','constraint'=>100],
            'telephone'      => ['type'=>'VARCHAR','constraint'=>20],
            'email'          => ['type'=>'VARCHAR','constraint'=>150],
            'password'       => ['type'=>'VARCHAR','constraint'=>255],
                'role'           => ['type'=>'ENUM','constraint'=>['client','admin','livreur','cuisinier'],'default'=>'client'],
            'ville'          => ['type'=>'VARCHAR','constraint'=>100,'null'=>true],
            'photo_profil'   => ['type'=>'VARCHAR','constraint'=>255,'null'=>true],
            'otp_code'       => ['type'=>'VARCHAR','constraint'=>10,'null'=>true],
            'otp_expires_at' => ['type'=>'DATETIME','null'=>true],
            'is_verified'    => ['type'=>'TINYINT','constraint'=>1,'default'=>0],
            'is_actif'       => ['type'=>'TINYINT','constraint'=>1,'default'=>1],
            'created_at'     => ['type'=>'DATETIME','null'=>true],
            'updated_at'     => ['type'=>'DATETIME','null'=>true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('email');
        $this->forge->addUniqueKey('telephone');
        $this->forge->createTable('users');
    }
 
    public function down()
    {
        $this->forge->dropTable('users');
    }
}