import { useEffect, useRef } from 'react';
import Phaser from 'phaser'

class Example extends Phaser.Scene
{
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    preload ()
    {
      this.load.image('grasslands', 'assets/grasslands.png');
      this.load.image('grass2water', 'assets/water.png');
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
      const grass = map.addTilesetImage('grasslands', 'grasslands')!;
      const grass2water = map.addTilesetImage('platform -grass2 to water-spritesheet', 'grass2water')!;
      const bgLayer = map.createLayer('Background', [grass, grass2water], 0, 0)!;
      const objLayer = map.createLayer('Objects', [grass, grass2water], 0, 0)!;


      // --- animated tiles ---
      const ts = grass2water;
      const animMap = new Map<number, number[]>();
      for (const [localId, data] of Object.entries(ts.tileData as any)) {
        const anim = (data as any).animation;
        if (anim) animMap.set(Number(localId), anim.map((f: any) => f.tileid + ts.firstgid));
      }

      const animatedTiles: { tile: Phaser.Tilemaps.Tile; frames: number[]; i: number }[] = [];
      for (const layer of [bgLayer, objLayer]) {
        layer.forEachTile(tile => {
          const frames = animMap.get(tile.index - ts.firstgid);
          if (frames) animatedTiles.push({ tile, frames, i: 0 });
        });
      }
      

      console.log('animated tiles found:', animatedTiles.length);

      this.time.addEvent({
        delay: 100,
        loop: true,
        callback: () => {
          for (const a of animatedTiles) {
            a.i = (a.i + 1) % a.frames.length;
            a.tile.index = a.frames[a.i];
          }
        },
      });


      this.player = this.physics.add.sprite(800, 800, 'youngster', 0);
      this.player.setScale(3);
      this.physics.world.setBounds(320, 288, 960, 960);
      this.player.setCollideWorldBounds(true);
      this.cursors = this.input.keyboard!.createCursorKeys();



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
