
const DIRECTION_LEFT  = 1;
const DIRECTION_RIGHT = 2;
const DIRECTION_UP    = 3;
const DIRECTION_DOWN  = 4;


const getrand = (minimum, maximum) => {
	return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;	
};

class Player{
	constructor(){
		this._direction    = { x: 1, y: 0 };
		this._head         = { x: 0, y: 2 };
		this._skeleton     = ["0,0", "0,1", "0,2"];
		this._lHeight      = 3;
		this._height       = 3;
	}

	face(direction) {
		switch(direction){
			case DIRECTION_LEFT  : this._direction = { x:  0, y: -1 }; break;
			case DIRECTION_RIGHT : this._direction = { x:  0, y:  1 }; break;
			case DIRECTION_UP    : this._direction = { x: -1, y:  0 }; break;
			case DIRECTION_DOWN  : this._direction = { x:  1, y:  0 }; break;
		}
	}
	
	get head()        { return this._head;     }
	get skeleton()    { return this._skeleton; }
	get lHeight()     { return this._lHeight;  }
	get height()      { return this._height;   }
	get direction()   { return this._direction;}

	set head(head)           { this._head      = head;     }
	set skeleton(skeleton)   { this._skeleton  = skeleton; }
	set lHeight(lHeight)     { this._lHeight   = lHeight;  }
	set height(height)       { this._height    = height;   }

}

class GameBoard {
	constructor( width = 20, height = 40 ){
		this.width  =  width;
		this.height =  height;
		this.powerupCoords = { x: -1, y: -1 };
	}
	get powerupPos(){
		return this.powerupCoords.x + "," + this.powerupCoords.y;
	}
}


class GameEngine {
	
	constructor(player, board, renderer){
		this._player   = player;
		this._board    = board;
		
		this.paused   = true;
		this.gameover = false;
		
		this._powupGreen = 0;
		this._powup      = false;
		this._fastStep   = true;
		this._powerUPCallback = () => {};
	}

	get fastStep(){ return this._fastStep; }
	get isPowerUP(){ return this._powup; }

	attachPowerUPCallback(cback){
		if( typeof cback == 'function'){
			this._powerUPCallback = cback;
		}
	}

	dropPowerup() {
		
		if(++this._powupGreen > 1) {
			this._fastStep = true;
			
			if(this._powup) { 
				this._powup = false;
				this._fastStep = false;
				this._powupGreen = 0;
			}else{
				this._powup = Math.random()*100 > 50;
			}

		}
		
		const getCoords = () => {
			const randx = getrand(0, this._board.width-1);
			const randy = getrand(0, this._board.height-1);
			return { x: randx, y: randy };
		};
		
		this._board.powerupCoords = getCoords();
	};

	_checkBounds(head){
		const pos   = head.x + "," + head.y;
		const index = this._player.skeleton.indexOf(pos);
		if( head.x < 0 || head.y < 0 ){ return true; }
		if( head.x >= this._board.width || head.y >= this._board.height ){ return true; }
		if( index > -1 && index < this._player.skeleton.length ){ return true; }
	};

	init(){
		this.dropPowerup();
	}

	step() {
		let append = false;

		let newhead   = { x: this._player.head.x, y: this._player.head.y };
			newhead.x = newhead.x + this._player.direction.x;
			newhead.y = newhead.y + this._player.direction.y;

		if(this._checkBounds(newhead)){
			this.gameover = true;
			return;
		}

		this._player.head = newhead;
		this._player.skeleton.push(newhead.x + "," + newhead.y );

		if(newhead.x == this._board.powerupCoords.x && newhead.y == this._board.powerupCoords.y){
			this._player.height+=1;
			this._powerUPCallback();			
		}

		if( this._player.lHeight != this._player.height ){
			this._player.lHeight=this._player.height;
			this.dropPowerup();
		}else{
			this._player.skeleton.shift(1);
		}
	}

}

const player    = new Player();
const board     = new GameBoard();
const engine    = new GameEngine(player, board);
let rendererA, rendererB;

let lastfastStepVal, interval;
const gamestep = ()=>{
	
	if(engine.paused){ return; }else{
		engine.step(); 
		if(rendererA){ rendererA.render(); }
		if(rendererB){ rendererB.render(); }
	}

	if(lastfastStepVal != engine.fastStep){
		clearInterval(interval);
		interval = setInterval(gamestep, engine.fastStep ? 100 : 1000 );
		lastfastStepVal = engine.fastStep;
	}
	
	if(engine.gameover){
		clearInterval(interval);
		return;
	}

};

function loadascii(){
	rendererA  = new RendererAscii(board, engine, player);
	rendererA.init();
	engine.paused = false;
}

function load3d(){
	rendererB  = new Renderer3D(player, board, engine);
	rendererB.init();
}

document.addEventListener("DOMContentLoaded", function(event) {
	engine.init();
	interval = setInterval(gamestep, 100);

	document.getElementById('loadascii').addEventListener("click", loadascii);
	document.getElementById('load3d').addEventListener("click", load3d);
});

