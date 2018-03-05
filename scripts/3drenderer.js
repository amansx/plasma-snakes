/*
* Author: Aman Singh
* Target: Squarespace | Plasma Snakes
*/

// A Bunch of Random Colors
const color1 = new BABYLON.Color3(1,1,0);
const color2 = new BABYLON.Color3(0,0,1);
const color3 = new BABYLON.Color3(1,0,1);
const color4 = new BABYLON.Color3(0.2, 0.2, 0.2);
const color5 = new BABYLON.Color3(0,0,1);
const color6 = new BABYLON.Color3(0.9,0.2,0);

// Define Block Height Ratio 3d to standard def
const BlockHeight = 0.25;

// Define Renderer Class
class Renderer3D{

	constructor(player, board, engine){
		this._engine = engine;
		this.board   = board;
		this.player  = player;	
	}

	// CreateBlock Gets triggered on every render step
	// and applies material to the pre-rendered blocks
	// Blocks are not created everytime and are 
	// pushed out of the view to avoid object creation
	createBlock(x, y, power) {

		// Make the blocks stay in bounds
		this.allblocks[x][y].position.y = BlockHeight/2;
		
		if(this._engine.gameover){
			this.textpanel.text = "GAMEOVER! Your Score: " + this.player.height;
			this.bgm.stop();
			this.highscoremusic.play();
		}
		if(power){
			if(this._engine.isPowerUP){
				this.allblocks[x][y].material = this.powblockm;
			}else{
				this.allblocks[x][y].material = this.foodblockm;
			}
		}else{
			this.allblocks[x][y].material = this.pblockm;
		}	
		this.blocks.push(this.allblocks[x][y]);
	};

	clearBlocks() {
		for( let b = 0, blen = this.blocks.length; b < blen; b++ ){
			this.blocks[b].position.y = 100;
		}
		this.blocks = [];
	};


	render(){
		this.clearBlocks();
		if( this.player.height != this.player.lHeight){
			feedmusic.play();
		}
		for( let i = 0, len = this.player.skeleton.length; i < len; i++ ){
			const coords    = this.player.skeleton[i].split(',');
				  coords[0] = parseInt(coords[0]);
				  coords[1] = parseInt(coords[1]);
			this.createBlock(coords[1], coords[0]);
			this.createBlock(this.board.powerupCoords.y, this.board.powerupCoords.x, true);
		}
	}

	setupRenderer() {
		for( let i = 0; i < this.board.height; i++ ){
			let col = [];
			for( let j = 0; j < this.board.width; j++ ){
				
				let preblock = BABYLON.MeshBuilder.CreateBox("box", {height: BlockHeight, width: BlockHeight, depth: BlockHeight}, this.scene);
				preblock.position.y = 100;
				preblock.position.x = (-((this.board.height/4)/2) + (BlockHeight/2) + (BlockHeight*i));
				preblock.position.z = (-((this.board.width/4)/2) + (BlockHeight/2) + (BlockHeight*j));
				preblock.material = this.pblockm;
				col.push(preblock);
			}
			this.allblocks.push(col);
		}

		let self = this;
		
		this.engine.runRenderLoop(function() {
			self.scene.render();
		});

		window.addEventListener('resize', function() {
			self.engine.resize();
		});
	};


	attachEventListeners(){
		document.onkeydown = (e) => {
		    e = e || window.event;
		    if (e.keyCode == '38') {      player.face(DIRECTION_DOWN); }
		    else if (e.keyCode == '40') { player.face(DIRECTION_UP); }
		    else if (e.keyCode == '37') { player.face(DIRECTION_LEFT); }
		    else if (e.keyCode == '39') { player.face(DIRECTION_RIGHT); }
		}
	}

	drawGrid() {
		for( var g = -(this.board.width/8), len = this.board.width/8; g <= len; g+=BlockHeight){
			var xaxis = BABYLON.MeshBuilder.CreateBox("grid", {height: 0.01, width: this.board.height/4, depth: 0.01}, this.scene);
			xaxis.material   = this.pblockm;
			xaxis.position.z = g;
		}
		for( var g = -(this.board.height/8), len = this.board.height/8; g <= len; g+=BlockHeight){
			var yaxis = BABYLON.MeshBuilder.CreateBox("grid", {height: 0.01, width: 0.01, depth: this.board.width/4 }, this.scene);
			yaxis.material   = this.pblockm;
			yaxis.position.x = g;
			this.grids.push(yaxis);
		}	
	}

	attachPropsToMaterial(material, color){
		material.emissiveColor = color;
		material.diffuseColor  = color;
		material.specularColor = color;
		material.ambientColor  = color;		
	}

	createScene(){
		let scene = new BABYLON.Scene(this.engine);
		let self = this;

		this.highscoremusic = new BABYLON.Sound("endgamemusic", "bgm/cheering.wav", scene );
		this.feedmusic      = new BABYLON.Sound("feedmusic",    "bgm/bloop.wav",    scene );
		this.bgm            = new BABYLON.Sound("bgmusic",      "bgm/bgm4.mp3",     scene, null, { loop: true });

		this.camera = new BABYLON.ArcRotateCamera("Camera", (-Math.PI / 2), (3 * Math.PI / 10), 9, BABYLON.Vector3.Zero(), scene);
		this.camera.setTarget(BABYLON.Vector3.Zero());

	    scene.clearColor = color4;

		var gl = new BABYLON.GlowLayer("glow", scene, { mainTextureFixedSize: 1024, blurKernelSize: 64 });
		gl.intensity = 0.5;

		gl.customEmissiveColorSelector = function(mesh, subMesh, material, result) {
			if (mesh.name === "grid") result.set(1, 0, 1, 1);
		}

		this.pblockm    = new BABYLON.StandardMaterial("boxmaterial",    scene); 
		this.foodblockm = new BABYLON.StandardMaterial("boxmaterial1",   scene); 
		this.powblockm  = new BABYLON.StandardMaterial("boxmaterial2",   scene);
		this.groundm    = new BABYLON.StandardMaterial("groundmaterial", scene);
		this.grids      = [];

		this.attachPropsToMaterial(this.pblockm, color1);
		this.attachPropsToMaterial(this.foodblockm, color3);		
		this.attachPropsToMaterial(this.powblockm, color5);
		this.attachPropsToMaterial(this.groundm, color2);
		this.drawGrid();

	    let textPanel = new BABYLON.GUI.TextBlock();
	    textPanel.color = "white";
	    textPanel.fontSize = 30;	    
		
	    let startButton     = BABYLON.GUI.Button.CreateSimpleButton("startbutton", "Start");
		startButton.width = "150px"
		startButton.height = "40px";
		startButton.color = "white";
		startButton.cornerRadius = 20;
		startButton.background = "green";
		startButton.onPointerUpObservable.add(function() {
			self._engine.paused = false;
			self.bgm.play();
			advancedTexture.removeControl(startButton);
		});


		// Play sound when Snake feeds
		this._engine.attachPowerUPCallback(()=>{
			this.feedmusic.play();
		})

	    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
	    advancedTexture.addControl(textPanel);
	   	advancedTexture.addControl(startButton);
	   	
	   	this.textpanel = textPanel;
	   	this.startbutton = startButton;

		this.scene = scene;
		this.setupRenderer();
	}	

	init(){

		this.allblocks = [];
		this.blocks    = [];

		this.canvas = document.getElementById('snakes');
		this.canvas.style.display = "block";
		this.engine = new BABYLON.Engine(this.canvas, true);
		this.createScene();
		this.attachEventListeners();
	}

}