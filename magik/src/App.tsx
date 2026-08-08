import { useEffect, useRef } from 'react';
import Phaser from 'phaser'

class Example extends Phaser.Scene
{
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    preload ()
    {
      this.load.image('grasslands', 'assets/grasslands.png');
      this.load.image('water', 'assets/water.png');
      this.load.image('grass2water', 'assets/water2.png');
      this.load.tilemapTiledJSON('map', 'assets/magikmap.tmj');
      this.load.spritesheet('youngster', 'assets/boy.png', {
        frameWidth: 16,
        frameHeight: 16,
      });
      this.load.on('loaderror', (f: any) => console.error('FAILED:', f.key, f.url));
    }

    create ()
    {
      const map = this.make.tilemap({ key: 'map' });
      const ts = map.tilesets.find(t => t.name === 'platform -grass2 to water-spritesheet')!;
      console.log(ts.tileData);
      const grass = map.addTilesetImage('grasslands', 'grasslands')!;
      const water = map.addTilesetImage('water', 'water')!;
      const grass2water = map.addTilesetImage('platform -grass2 to water-spritesheet', 'grass2water')!;
      map.createLayer('Background', [grass, water, grass2water], 0, 0);
      map.createLayer('Objects', [grass, water, grass2water], 0, 0);

      this.player = this.physics.add.sprite(400, 400, 'youngster', 0);
      this.cursors = this.input.keyboard!.createCursorKeys();
      this.player.setScale(3);
      this.physics.world.setBounds(320, 288, 960, 992);
      this.player.setCollideWorldBounds(true);



      const cam = this.cameras.main;
      cam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
      cam.startFollow(this.player);
      cam.setZoom(1.5);

      //animations
      this.anims.create({
        key: 'walk-down',
        frames: this.anims.generateFrameNumbers('youngster', { frames: [0, 1, 2] }),
        frameRate: 6,
        repeat: -1,
      });
      this.anims.create({
        key: 'walk-up',
        frames: this.anims.generateFrameNumbers('youngster', { frames: [3, 4, 5] }),
        frameRate: 6,
        repeat: -1,
      });
      this.anims.create({
        key: 'walk-left',
        frames: this.anims.generateFrameNumbers('youngster', { frames: [6, 7] }),
        frameRate: 6,
        repeat: -1,
      });
      this.anims.create({
        key: 'walk-right',
        frames: this.anims.generateFrameNumbers('youngster', { frames: [8, 9] }),
        frameRate: 6,
        repeat: -1,
      });
    }
    update() {
      const speed = 100;
      this.player.setVelocity(0);
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-speed);
        this.player.anims.play('walk-left', true);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(speed);
        this.player.anims.play('walk-right', true);
      } else if (this.cursors.up.isDown) {
        this.player.setVelocityY(-speed);
        this.player.anims.play('walk-up', true);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(speed);
        this.player.anims.play('walk-down', true);
      } else {
        this.player.anims.stop();
      }
    }
    
}

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current!;
    console.log('container at mount:', el.clientWidth, el.clientHeight);
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current!,
      width: 960,
      height: 640,
      pixelArt: true,
      scene: Example,
      physics: {
          default: 'arcade',
          arcade: {
              gravity: { y: 0, x: 0 }
          }
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    });

    return () => {
      game.destroy(true);
    }
  }, []);


  return (
    <div ref={containerRef} style={{ width: '100vw', height: '100vh' }}/>
  )
}

export default App
