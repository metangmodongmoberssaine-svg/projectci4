<?php
 
namespace App\Database\Migrations;
use CodeIgniter\Database\Migration;
 
class CreateAdressesTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'         => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'id_user'    => ['type' => 'INT', 'unsigned' => true],
            'libelle'    => ['type' => 'VARCHAR', 'constraint' => 100], // Ex: Maison, Bureau, Pour Maman
            'adresse'    => ['type' => 'VARCHAR', 'constraint' => 255], // Description textuelle (ex: Face entrée camp de Gaulle)
            'ville'      => ['type' => 'VARCHAR', 'constraint' => 100, 'default' => 'Douala'],
            
            // Ajout des coordonnées pour la géolocalisation
            'latitude'   => ['type' => 'DECIMAL', 'constraint' => '10,8', 'null' => true],
            'longitude'  => ['type' => 'DECIMAL', 'constraint' => '11,8', 'null' => true],
            
            'is_default' => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 0],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('id_user', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('adresses');
    }
 
    public function down()
    {
        $this->forge->dropTable('adresses');
    }
}