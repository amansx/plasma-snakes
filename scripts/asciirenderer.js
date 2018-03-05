
class RendererAscii{

	constructor(board, engine, player){

		this._engine = engine;
		this.board   = board;
		this.player  = player;		

	}

	init(){
		this.ta = document.getElementById('asciisnakes');
		this.ta.style.display = "block";
		
		document.onkeydown = (e) => {
		    e = e || window.event;
		    if (e.keyCode == '38') {      this.player.face(DIRECTION_UP); }
		    else if (e.keyCode == '40') { this.player.face(DIRECTION_DOWN); }
		    else if (e.keyCode == '37') { this.player.face(DIRECTION_LEFT); }
		    else if (e.keyCode == '39') { this.player.face(DIRECTION_RIGHT); }
		}

	}

	render(){		
		let output = "";
		
		for( let row = 0, rowlen = this.board.width; row < rowlen; row++ ){
			for( let col = 0, collen = this.board.height; col < collen; col++ ){
				const pos = row + "," + col;
				if( this.board.powerupPos == pos ){
					const char = this._engine.isPowerUP ? "o": "*";
					output +=  col == 0 ? "|"+char+"|" : char+"|";
				}else if( this.player.skeleton.indexOf(pos) > -1){
					output += col == 0 ? "|*|" : "*|";
				}else{
					output += col == 0 ? "|_|" : "_|";
				}
			}
			output += "\n";
		}
		
		if(this._engine.gameover){
			output += "GAMEOVER, Your Score: " + this.player.height;
		}else if(!this._engine.fastStep){
			output += "Acquired Powerup!";
		}
		
		this.ta.value = output;
	
	}

}