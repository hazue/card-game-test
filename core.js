var width = 200;
var height = 400;
var canvas = document.getElementById('virgin');
var canvas_ctx = canvas.getContext('2d');
var block_length = 17;
var space = 3;	//the space in between each blocks
var movingMinosX;	//coord x will be initialized in function createNewMinos()
var movingMinosY;	//same as above
var movingMinosType;
var movingMinosShape = [[0,0],[0,0],[0,0],[0,0]];
var blocks2D = new Array(10);	//something like a dynamic game board, it stores the location of movingMinos
var fixedBlocks	= new Array(10);	//has values for blocks that are already stop moving and fixed. Does not stores location of movingMinos
var mX = 0;
var delayCount = 0;
var delaySpeed = 5;
var rotate = false;

canvas.width = width;
canvas.height = height;

initBlocks2D();	//initial both blocks2D and fixedBlocks

//document.write('nya');	//to test if js is working properly

createNewMinos();

var loopG;

loopGame();

function loopGame()
{
	clearScreen();
	placeMovingMinos();
	drawBlocks();
	canvas_ctx.closePath();
	loopG = setTimeout('loopGame()', 50);
	
	addEventListener('keydown', function (e) {
		if(e.keyCode == 37)
		{
			//left
			if(canMoveLeft())
				mX = -1;
			else
				mX = 0;
		}
		else if(e.keyCode == 38)
		{
			//up
			rotate = true;
		}
		else if(e.keyCode == 39)
		{
			//right
			if(canMoveRight())
				mX = 1;
			else
				mX = 0;
		}
		else if(e.keyCode == 40)
		{
			//down
			delaySpeed = 1;
		}
	});
	
	addEventListener('keyup', function (e) {
		if(e.keyCode == 37)
		{
			//left
			mX = 0;
		}
		else if(e.keyCode == 38)
		{
			//up
			rotate = false;
		}
		else if(e.keyCode == 39)
		{
			//right
			mX = 0;
		}
		else if(e.keyCode == 40)
		{
			//down
			delaySpeed = 5;
		}
	});
}

function clearScreen()
{	
	canvas_ctx.clearRect(0,0,width,height);
}

function createNewMinos()
{
	movingMinosX = 5;
	movingMinosY = 19;
	movingMinosType = Math.floor((Math.random()*6));	//random generate the type of Minos
	 
	switch(movingMinosType)
	{
		case 0:	movingMinosShape = [[0,1],[0,0],[0,-1],[1,-1]];	//L-shape
				break;
		case 1: movingMinosShape = [[0,1],[0,0],[0,-1],[-1,-1]]; //L-rev
				break;
		case 2: movingMinosShape = [[-1,-1],[0,-1],[0,0],[1,0]]; //S-shape
				break;
		case 3: movingMinosShape = [[1,-1],[0,-1],[0,0],[-1,0]]; //S-rev
				break;
		case 4: movingMinosShape = [[-1,0],[0,0],[1,0],[0,-1]];	//T-shape
				break;
		case 5: movingMinosShape = [[-1,0],[0,0],[1,0],[2,0]]; //I-shape
				break;
		case 6: movingMinosShape = [[0,0],[1,0],[0,-1],[1,-1]]; //Square
				break;
	}
}

function drawBlocks()	//draws all blocks from blocks2D. Which means movingMinos is already drawn here
{
	var x = 0;
	var y = 0;
	
	for(i=19; i>=0; i--)
	{
		for(j=0; j<10; j++)
		{
			canvas_ctx.fillStyle = getColor(blocks2D[j][i]);
			canvas_ctx.fillRect(x, y, block_length, block_length);
			x = x + block_length + space;
		}
		y = y + block_length + space;
		x = 0;
	}
}

function getColor(colorNo)
{
	var colorVal;
	
	switch(colorNo)
	{
		case 0: //L-shape
				colorVal = '#FF9933';	//orange
				break;
		case 1: //L-rev
				colorVal = '#0033CC';	//blue
				break;
		case 2: //S-shape
				colorVal = '#33FF66';	//green
				break;
		case 3: //S-rev
				colorVal = '#CC0033';	//red
				break;
		case 4: //T-shape
				colorVal = '#990099';	//magenta
				break;
		case 5: //I-shape
				colorVal = '#66CCFF';	//cyan
				break;
		case 6: //Square
				colorVal = '#FFFF00';	//yellow
				break;
		default: colorVal = '#BBBBBB';	//semi-white
	}
	
	return colorVal;
}

function placeMovingMinos()
{	
	var tempX;
	var tempY;
	
	if(rotate)
	{
		removeMinosTrail();
		rotateMinos();
		rotate = false;
	}
	
	if(canMoveDown())
	{
		if((delayCount%delaySpeed) == 0)
			movingMinosY = movingMinosY - 1;
		
		removeMinosTrail();
		removeFullLines();	//remove lines that are already filled with 10 blocks
		delayCount++;
	}
	else
	{
		if(gameEnds())
		{
			document.getElementById('gameTitle').innerHTML = 'Game Over';
			//clearTimeOut(loopG);
		}
		else
		{
			//since the mino stops moving, save it's location to fixedBlocks
			for(i=0; i<4; i++)
			{
				tempX = movingMinosShape[i][0] + movingMinosX;
				tempY = movingMinosShape[i][1] + movingMinosY;
				fixedBlocks[tempX][tempY] = 1;
			}
			createNewMinos();
		}
	}
	
	//The extra conditional checking below exist to make sure
	//the pc respond speed will not exceed the drawing speed
	//if the line of code "movingMinosX += mX" is placed outside of this condition check
	//then movingMinosX's value in the memory might increase faster (e.g. x=10, when min=0, max=9)
	//than the drawing. When that really happens
	//then array-out-of-border for blocks2D will occur
	
	if(mX > 0)
	{
		if(canMoveRight())
		{
			movingMinosX += mX;
			removeMinosTrail();
		}
	}
	else if(mX < 0)
	{
		if(canMoveLeft())
		{
			movingMinosX += mX;
			removeMinosTrail();
		}
	}
	
	for(i=0; i<4; i++)
	{
		tempX = movingMinosShape[i][0] + movingMinosX;		
		tempY = movingMinosShape[i][1] + movingMinosY;
		if( (tempX >= 0) && (tempX <= 9) && (tempY >= 0))	//having this condition check to avoid invalid tempX and tempY values
			blocks2D[tempX][tempY] = movingMinosType;
	}
}

function rotateMinos()
{
	//WARNING
	//This function doesn't checks if the movingMinos is out-of-border after rotating.
	//so rotating the movingMinos while near other blocks or border is likely to crash the game
	
	if(movingMinosType == 6)		//is square minos, which cannot rotate
		return;
		
	var changedShape = new Array(4);

	for(i=0; i<4; i++)
	{
		changedShape[i] = [movingMinosShape[i][1]*-1,movingMinosShape[i][0]];
	}
	
	movingMinosShape = changedShape;
}

function removeMinosTrail()
{
	//if minos just rotated, then we track its shadow and remove only the shadow
	if(rotate)
	{
		trailPosition = movingMinosShape;
					
		for(i=0; i<trailPosition.length; i++)
		{
			tempX = movingMinosX + trailPosition[i][0];
			tempY = movingMinosY + trailPosition[i][1];
			if( (tempX >= 0) && (tempX <= 9) && (tempY >= 0))
				blocks2D[tempX][tempY] = -1;
		}
		return;
	}

	//else, we remove everything
	//but instead of checking and removing all blocks, we check and remove blocks above the movingMinos
	
	var startingLine = -10;	//contains value of the starting 'line' that is used to check and remove trails
	
	for(i=0; i<4; i++)
	{
		if(movingMinosShape[i][1] < startingLine)
			startingLine = movingMinosShape[i][1];
	}
	
	startingLine += movingMinosY;
	
	//start to remove trails
	for(y=startingLine; y<20; y++)
	{
		for(x=0; x<10; x++)
		{
			if(fixedBlocks[x][y] <= 0)	//if it's an empty block
				blocks2D[x][y] = -1;
		}
	}
}

function removeFullLines()
{
	var blocksCounter;
	var filledLines = new Array();
	var linesCounter = 0;
	
	for(y=19; y>=0; y--)
	{
		blocksCounter = 0;
		for(x=0; x<10; x++)
		{
			if(blocks2D[x][y] > -1)
				blocksCounter++;
		}
		
		if(blocksCounter == 10)
		{
			filledLines[linesCounter] = y;
			linesCounter++;
		}
			
		if(filledLines.length >= 4)
			break;	//because no matter what, it's not possible to have more than 4 lines filled at the same time
	}
	
	if(linesCounter == 0)
		return;	//nothing to remove
	else
	{
		for(i=0; i<linesCounter; i++)
		{
			//everything above the value of filledLines[i], move them 1 block downward. So it will repeat multiple times if there're more than 1 fullLine
			for(j=filledLines[i]; j<19; j++)	//because of below's j+1, so cannot j<20
			{
				for(x=0; x<10; x++)
				{
					blocks2D[x][j] = blocks2D[x][j+1];
					fixedBlocks[x][j] = fixedBlocks[x][j+1];
				}
			}
		}
	}
}

function canMoveDown()
{
	var blocksToBeChecked = getudCollision(1);
	
	var tempX, tempY;
	
	for(i=0; i<blocksToBeChecked.length; i++)
	{
		tempX = movingMinosX + blocksToBeChecked[i][0];
		tempY = movingMinosY + blocksToBeChecked[i][1];
		if( (tempY<=0) || (blocks2D[tempX][tempY-1] != -1) )
			return false;
	}
	return true;
}

function canMoveLeft()
{	
	blocksToBeChecked = getlrCollision(0);	//arg 0 for left, arg 1 for right
	var tempX, tempY;

	for(i=0; i<blocksToBeChecked.length; i++)
	{
		tempX = movingMinosX + blocksToBeChecked[i][0];
		tempY = movingMinosY + blocksToBeChecked[i][1];
		if( (tempX<=0) || (blocks2D[tempX-1][tempY] != -1) )
			return false;
	}
	
	return true;
}

function canMoveRight()
{	
	blocksToBeChecked = getlrCollision(1);	//arg 0 for left, arg 1 for right
	var tempX, tempY;
	
	for(i=0; i<blocksToBeChecked.length; i++)
	{
		tempX = movingMinosX + blocksToBeChecked[i][0];
		tempY = movingMinosY + blocksToBeChecked[i][1];
		if( (tempX>=9) || (blocks2D[tempX+1][tempY] != -1) )
			return false;
	}
	
	return true;
}

function getudCollision(ud)	//ud = up or down. up = 0, down = 1
{
	var blockX = new Array();
	var blockY = new Array();
	var noOfBlocksToBeChecked = 1;
	var tempMinosAxis = sortToAscend(0);	//sort it first to make comparison easier
	
	blockX[0] = tempMinosAxis[0];
	
	//comparison to check how many different coord X there are.
	//eg. 0,1,1,1 means 2
	//eg. -1,0,1,1 means 3 different coord X
	for(i=1; i<4; i++)
	{
		if(blockX[i-1] != tempMinosAxis[i])
		{
			blockX[noOfBlocksToBeChecked] = tempMinosAxis[i];
			noOfBlocksToBeChecked++;
		}
	}
	
	for(i=0; i<noOfBlocksToBeChecked; i++)
	{
		if(ud == 0)
		{
			blockY[i] = -10;
		}
		else if(ud == 1)
		{
			blockY[i] = 10;
		}
		
		for(j=0; j<4; j++)
		{
			if( movingMinosShape[j][0] == blockX[i] )
			{
				if(ud == 0)
				{
					if(movingMinosShape[j][1] > blockY[i])
						blockY[i] = movingMinosShape[j][1];
				}
				else if(ud == 1)
				{
					if(movingMinosShape[j][1] < blockY[i])
						blockY[i] = movingMinosShape[j][1];
				}
			}
		}
		
	}
	
	var blocksToBeChecked = new Array();

	for(i=0; i<noOfBlocksToBeChecked; i++)
	{
		blocksToBeChecked[i] = [blockX[i],blockY[i]];
	}
	
	return blocksToBeChecked;
}

function getlrCollision(lr)	//lr = left or right
{
	var blockX = new Array();
	var blockY = new Array();
	var noOfBlocksToBeChecked = 1;
	var tempMinosAxis = sortToAscend(1);	//sort it first to make comparison easier
	
	blockY[0] = tempMinosAxis[0];
	
	for(i=1; i<4; i++)
	{
		if(blockY[i-1] != tempMinosAxis[i])
		{
			blockY[noOfBlocksToBeChecked] = tempMinosAxis[i];
			noOfBlocksToBeChecked++;
		}
	}

	if(lr == 0)	//left
		blockX = getSmallerValue(noOfBlocksToBeChecked, blockY);
	else if(lr == 1)	//right
		blockX = getLargerValue(noOfBlocksToBeChecked, blockY);
	
	var blocksToBeChecked = new Array(noOfBlocksToBeChecked);
	
	for(i=0; i<noOfBlocksToBeChecked; i++)
	{
		blocksToBeChecked[i] = [blockX[i],blockY[i]];
	}
	
	return blocksToBeChecked;
}

function getLargerValue(n, blockY)
{
	var blockX = new Array();
	
	for(i=0; i<n; i++)
	{
		blockX[i] = -10;	//initialize blockX[n] so it can be compare later
		for(j=0; j<4; j++)
		{
			if( movingMinosShape[j][1] == blockY[i] )
			{
				if(movingMinosShape[j][0] > blockX[i])
					blockX[i] = movingMinosShape[j][0];
			}
		}
	}
	
	return blockX;
}

function getSmallerValue(n, blockY)
{
	var blockX = new Array();
	
	for(i=0; i<n; i++)
	{
		blockX[i] = 10;	//initialize blockX[n] so it can be compare later
		for(j=0; j<4; j++)
		{
			if( movingMinosShape[j][1] == blockY[i] )
			{
				if(movingMinosShape[j][0] < blockX[i])
					blockX[i] = movingMinosShape[j][0];
			}
		}
	}
	
	return blockX;
}

function gameEnds()
{
	for(i=0; i<10; i++)
	{
		if(blocks2D[i][19] != -1)
			return true;
	}
	
	return false;
}

function sortToAscend(xy)	//sort X-axis or Y-axis for movingMinosShape
{
	var tempArr = new Array(4);
	
	for(i=0; i<4; i++)
		tempArr[i] = movingMinosShape[i][xy];
	
	var counter;
	var temp;
	
	while(true)
	{
		counter = 1;
		for(i=0; i<3; i++)
		{
			if(tempArr[i] > tempArr[i+1])
			{
				//swap the value
				temp = tempArr[i];
				tempArr[i] = tempArr[i+1];
				tempArr[i+1] = temp;
			}
			else
				counter++;
		}
		if(counter == 4)
			break;
	}

	return tempArr;
}

function initBlocks2D()
{
	for(i=0; i<10; i++)
	{
		blocks2D[i] = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
		fixedBlocks[i] = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
	}
}