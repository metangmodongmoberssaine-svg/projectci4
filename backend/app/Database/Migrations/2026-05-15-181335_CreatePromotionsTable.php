<?php
 
namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;
 
class CreatePromotionsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'           => [
                'type'           => 'INT',
                'unsigned'       => true,
                'auto_increment' => true
            ],
            'id_repas'     => [
                'type'           => 'INT',
                'unsigned'       => true,
                'null'           => true
            ],
            'id_categorie' => [
                'type'           => 'INT',
                'unsigned'       => true,
                'null'           => true
            ],
            'new_amount'   => [ // Remplacé par new_amount ici !
                'type'           => 'DECIMAL',
                'constraint'     => '10,2',
                'null'           => false
            ],
            'type'         => [
                'type'           => 'ENUM',
                'constraint'     => ['montant_fixe', 'pourcentage'],
                'default'        => 'montant_fixe'
            ],
            'date_debut'   => [
                'type'           => 'DATE'
            ],
            'date_fin'     => [
                'type'           => 'DATE'
            ],
            'is_actif'     => [
                'type'           => 'TINYINT',
                'constraint'     => 1,
                'default'        => 1
            ],
            'created_at'   => [
                'type'           => 'DATETIME',
                'null'           => true
            ],
            'updated_at'   => [
                'type'           => 'DATETIME',
                'null'           => true
            ],
        ]);

        $this->forge->addKey('id', true);
        
        // Clés étrangères vers tes tables repas et catégories
        $this->forge->addForeignKey('id_repas', 'repas', 'id', 'SET NULL', 'CASCADE');
        $this->forge->addForeignKey('id_categorie', 'categories', 'id', 'SET NULL', 'CASCADE');
        
        $this->forge->createTable('promotions');
    }
 
    public function down()
    {
        $this->forge->dropTable('promotions');
    }
}