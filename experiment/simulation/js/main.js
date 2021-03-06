'use strict';

document.addEventListener('DOMContentLoaded', function() {

	const restartButton = document.getElementById('restart');
	const instrMsg = document.getElementById('procedure-message');

	restartButton.addEventListener('click', restart);

	function randomNumber(min, max) {
		return Number((Math.random() * (max - min) + min).toFixed(2));
	};

	function finish(step) {
		if(!flag && step === enabled.length - 1)
		{
			flag = true;
			const retTrace = logic(tableData);
			document.getElementById("output5").innerHTML = "Normal Stress = " + String(1.55) + "N/cm" + "2".sup();
			generateTableHead(table, Object.keys(tableData[0]));
			generateTable(table, tableData);
			drawGraph([retTrace], ['Horizontal Displacement (cm)', 'Horizontal Shear Stress (N/cm<sup>2</sup>)'], 'plot');
			drawGraph([trace(normalStress, [Math.max(...retTrace.y), randomNumber(2.9, 3.3), randomNumber(4.5, 4.9)], 'Stress Graph', true), trace(normalStress, normalStress, 'Ideal Stress Graph')], ['Normal Stress (N/cm<sup>2</sup>)', 'Shear Stress (N/cm<sup>2</sup>)'], 'stressPlot');

			document.getElementById("main").style.display = 'none';
			document.getElementById("graph").style.display = 'inline-block';

			document.getElementById("apparatus").style.display = 'none';
			document.getElementById("observations").style.width = '40%';
			if(small)
			{
				document.getElementById("observations").style.width = '85%';
			}
		}
	};

	function logic(tableData)
	{
		let xVals = [], yVals = [];
		tableData.forEach(function(row, index) {
			row['Shear Stress (N/cm<sup>2</sup>)'] = Number((row['Horizontal Shear Force (N)'] / area).toFixed(2));
			xVals.push(row['Horizontal Displacement (cm)']);
			yVals.push(row['Shear Stress (N/cm<sup>2</sup>)']);
		});

		return trace(xVals, yVals, 'Graph');
	};

	function limCheck(obj, translate, lim, step)
	{
		if(obj.pos[0] === lim[0])
		{
			translate[0] = 0;
		}

		if(obj.pos[1] === lim[1])
		{
			translate[1] = 0;
		}

		if(translate[0] === 0 && translate[1] === 0)
		{
			if(step === 2)
			{
				document.getElementById("output1").innerHTML = "Mass of mould = " + String(720) + " g";
			}
			return step + 1;
		}

		return step;
	};

	function updatePos(obj, translate)
	{
		obj.pos[0] += translate[0];
		obj.pos[1] += translate[1];
	};

	function canvas_arrow(ctx, fromx, fromy, tox, toy) {
		const headlen = 10, dx = tox - fromx, dy = toy - fromy, angle = Math.atan2(dy, dx);
		ctx.moveTo(fromx, fromy);
		ctx.lineTo(tox, toy);
		ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
		ctx.moveTo(tox, toy);
		ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
	};

	class rect {
		constructor(height, width, x, y, color) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.color = color; 
		};

		draw(ctx) {
			ctx.fillStyle = this.color;
			ctx.beginPath();
			ctx.rect(this.pos[0], this.pos[1], this.width, this.height);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		};

		heightChange(change, lim) {
			if(this.height === lim)
			{
				return 1;
			}

			this.height += change;
			return 0;
		};
	};

	class multiRect {
		constructor(height, width, x, y, gap, color) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.gap = [...gap];
			this.color = color;
			
			this.arr = [new rect(this.height, this.width, this.pos[0], this.pos[1], color), new rect(this.height, this.width, this.pos[0] + this.gap[0], this.pos[1] + this.height + this.gap[1], color)];
		};

		draw(ctx) {
			this.arr.forEach((elem, ind) => {
				elem.draw(ctx);
			});
		};
	};

	class shearDevice {
		constructor(height, width, radius, x, y) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.radius = radius;
			this.angle = 0;
			this.baseStart = 0.8 * this.width;
			this.endMargin = 0.1 * this.width; 
		};

		draw(ctx) {
			const boxWidth = 0.1 * this.width, pipeWidth = 0.1 * this.height, baseWidth = 0.025 * this.width, lastSeg  = 0.25 * this.width;

			ctx.fillStyle = data.colors.black;
			ctx.beginPath();
			ctx.rect(this.pos[0], this.pos[1], boxWidth, this.height);
			ctx.rect(this.pos[0] + this.width - lastSeg, this.pos[1], boxWidth, this.height);
			ctx.fill();
			ctx.stroke();
			ctx.closePath();

			ctx.beginPath();
			ctx.fillStyle = data.colors.gray;
			ctx.rect(this.pos[0] + boxWidth, this.pos[1] + this.height / 2 - pipeWidth / 2, this.width - boxWidth - this.baseStart, pipeWidth);
			ctx.rect(this.pos[0] + this.width - this.baseStart, this.pos[1], baseWidth, this.height);
			ctx.rect(this.pos[0] + this.width - this.baseStart + baseWidth, this.pos[1] + this.height - baseWidth, this.baseStart - this.endMargin - 2 * baseWidth - lastSeg, baseWidth);
			ctx.rect(this.pos[0] + this.width - this.endMargin - baseWidth - lastSeg, this.pos[1], baseWidth, this.height);

			ctx.rect(this.pos[0] + this.width - this.baseStart + baseWidth, this.pos[1] + 60, 25, 45);
			ctx.rect(this.pos[0] + this.width - this.endMargin - baseWidth - lastSeg, this.pos[1] + 60, -15, 45);
			ctx.fill();
			ctx.stroke();
			ctx.closePath();

			ctx.beginPath();
			ctx.fillStyle = data.colors.white;
			ctx.arc(this.pos[0] + this.width - this.radius, this.pos[1] + this.height / 2, this.radius, 0, 2 * Math.PI);
			canvas_arrow(ctx, this.pos[0] + this.width - this.radius, this.pos[1] + this.height / 2, this.pos[0] + this.width + this.radius * (Math.cos(this.angle) - 1), this.pos[1] + this.height / 2 + this.radius * Math.sin(this.angle));
			ctx.moveTo(this.pos[0] + this.width - 2 * this.radius, this.pos[1] + this.height / 2);
			ctx.lineTo(this.pos[0] + this.width - lastSeg + boxWidth, this.pos[1] + this.height / 2);
			ctx.fill();
			ctx.stroke();
		};

		shear(change) {
			if(this.endMargin <= 25)
			{
				return 1;
			}

			this.angle += 5 * change * Math.PI / 180;
			this.baseStart -= change;
			this.endMargin -= change;
			return 0;
		};
	};

	class weight {
		constructor(height, width, x, y) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.img = new Image();
			this.img.src = './images/weighing-machine.png';
			this.img.onload = () => {ctx.drawImage(this.img, this.pos[0], this.pos[1], this.width, this.height);}; 
		};

		draw(ctx) {
			ctx.drawImage(objs['weight'].img, objs['weight'].pos[0], objs['weight'].pos[1], objs['weight'].width, objs['weight'].height);
		};
	};

	class shearBox {
		constructor(height, width, x, y) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.gap = [0, 0];
		};

		draw(ctx) {
			const margin = 20, handleWidth = 20, stonesHeight = 20;
			new multiRect(this.height / 2, this.width, this.pos[0], this.pos[1], this.gap, data.colors.yellow).draw(ctx);
			new multiRect(stonesHeight, this.width - 2 * margin, this.pos[0] + margin, this.pos[1], [this.gap[0], this.height - 2 * stonesHeight], data.colors.lightBlue).draw(ctx);

			ctx.fillStyle = data.colors.gray;
			ctx.beginPath();
			ctx.moveTo(this.pos[0] + this.width - margin, this.pos[1]);
			ctx.lineTo(this.pos[0] + this.width - margin, this.pos[1] - this.height * 0.5);
			ctx.lineTo(this.pos[0] + 1.6 * this.width - margin, this.pos[1] - this.height * 0.5);
			ctx.lineTo(this.pos[0] + 1.6 * this.width - margin, this.pos[1] + this.height / 2);
			ctx.lineTo(this.pos[0] + 1.6 * this.width - margin - handleWidth, this.pos[1] + this.height / 2);
			ctx.lineTo(this.pos[0] + 1.6 * this.width - margin - handleWidth, this.pos[1] - this.height * 0.5 + handleWidth);
			ctx.lineTo(this.pos[0] + this.width, this.pos[1] - this.height * 0.5 + handleWidth);
			ctx.lineTo(this.pos[0] + this.width, this.pos[1]);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		};

		shear(change) {
			this.gap[0] += change;
		};
	};

	class soils {
		constructor(num, currSoil) {
			this.height = currSoil.height / 2;
			this.width = currSoil.width;
			this.pos = [...currSoil.pos];
			this.soils = [];

			for(let i = 0; i < num; i += 1)
			{
				this.soils.push(new rect(this.height, this.width, this.pos[0], this.pos[1] + this.height * i, currSoil.color));
			}
		};

		draw(ctx) {
			this.soils.forEach((soil, idx) => {
				soil.draw(ctx);
			});
		};

		shear(change) {
			this.soils[this.soils.length - 1].pos[0] += change;
		};
	};

	function trace(xVals, yVals, name, flag=false)
	{
		const retTrace = {
			x: xVals,
			y: yVals,
			name: name,
			type: 'scatter',
			mode: 'lines',
		};

		if(flag)
		{
			retTrace.mode = 'markers';
		}

		return retTrace;
	};

	function drawGraph(traces, text, id) {
		try {
			const layout = {
				width: 400,
				height: 400,
				xaxis: {
					title: {
						text: text[0],
						font: {
							family: 'Courier New, monospace',
							size: 18,
							color: '#000000'
						}
					},
				},
				yaxis: {
					title: {
						text: text[1],
						font: {
							family: 'Courier New, monospace',
							size: 18,
							color: '#000000'
						}
					},
				}
			};

			const config = {responsive: true};
			Plotly.newPlot(id, traces, layout, config);
		}

		catch (err) {
			console.error(err);
			alert(err);
		}
	};

	function init()
	{
		document.getElementById("output1").innerHTML = "Mass of mould = ____ g";
		document.getElementById("output2").innerHTML = "Mass of soil = ____ g";
		document.getElementById("output3").innerHTML = "Shear Box Diameter = ____ cm";
		document.getElementById("output4").innerHTML = "Shear Box Area, A = ____ cm" + "2".sup();
		document.getElementById("output5").innerHTML = "Normal Stress = ____ N/cm" + "2".sup(); 

		objs = {
			"shearDevice": new shearDevice(120, 540, 20, 260, 260),
			"weight": new weight(270, 240, 40, 190),
			"shearBox": new shearBox(90, 170, 75, 190),
			"mould": new rect(50, 150, 650, 330, data.colors.gray),
			"soil": new rect(0, 130, 95, 260, data.colors.soilBrown),
		};
		keys = [];

		enabled = [["weight"], ["weight", "mould"], ["weight", "mould"], ["weight", "mould", "soil"], ["soil", "shearBox"], ["soil", "shearBox", "shearDevice"], ["soil", "shearBox", "shearDevice"], ["soil", "shearBox", "shearDevice"], []];
		step = 0;
		translate = [0, 0];
		lim = [-1, -1];
		flag = false;
	};

	function restart() 
	{ 
		window.clearTimeout(tmHandle); 

		document.getElementById("main").style.display = 'block';
		document.getElementById("graph").style.display = 'none';
		document.getElementById("apparatus").style.display = 'block';
		document.getElementById("observations").style.width = '';

		table.innerHTML = "";
		init();

		tmHandle = window.setTimeout(draw, 1000 / fps); 
	};

	function generateTableHead(table, data) {
		let thead = table.createTHead();
		let row = thead.insertRow();
		data.forEach(function(key, ind) {
			let th = document.createElement("th");
			th.innerHTML = key;
			row.appendChild(th);
		});
	};

	function generateTable(table, data) {
		data.forEach(function(rowVals, ind) {
			let row = table.insertRow();
			Object.keys(rowVals).forEach(function(key, i) {
				let cell = row.insertCell();
				cell.innerHTML = rowVals[key];
			});
		});
	};

	function check(event, translate, step, flag=true)
	{ 
		if(translate[0] !== 0 || translate[1] !== 0)
		{
			return step;
		}

		const canvasPos = [(canvas.width / canvas.offsetWidth) * (event.pageX - canvas.offsetLeft), (canvas.height / canvas.offsetHeight) * (event.pageY - canvas.offsetTop)];
		const errMargin = 10;

		let hover = false;
		canvas.style.cursor = "default";
		keys.forEach(function(val, ind, arr) {
			if(canvasPos[0] >= objs[val].pos[0] - errMargin && canvasPos[0] <= objs[val].pos[0] + objs[val].width + errMargin && canvasPos[1] >= objs[val].pos[1] - errMargin && canvasPos[1] <= objs[val].pos[1] + objs[val].height + errMargin)
			{
				if(step === 2 && val === "mould")
				{
					hover = true;
					translate[0] = -5;
					translate[1] = -5;
					lim[0] = 85;
					lim[1] = 210;
				}

				else if(step === 6 && val === "shearBox")
				{
					hover = true;
					translate[0] = 1;
					translate[1] = 1;
					lim[0] = 410;
					lim[1] = 365 - objs['shearBox'].height;
				}

				else if(step === 7 && val === "shearBox")
				{
					hover = true;
					translate[0] = 1;
					if(flag)
					{
						const temp = new soils(2, objs['soil']);
						objs['soil'] = temp;
					}
				}
			}
		});

		if(!flag && hover)
		{
			canvas.style.cursor = "pointer";
			translate[0] = 0;
			translate[1] = 0;
			lim[0] = 0;
			lim[1] = 0;
		}

		return step;
	};

	const canvas = document.getElementById("main");
	canvas.width = 840;
	canvas.height = 400;
	canvas.style = "border:3px solid";
	const ctx = canvas.getContext("2d");
	ctx.lineWidth = 3;

	const border = data.colors.black, lineWidth = 3, fps = 150;
	const msgs = [
		"Click on 'Weighing Machine' in the apparatus menu to add a weighing machine to the workspace.", 
		"Click on 'Mould' in the apparatus menu to add a mould to the workspace.",
		"Click on the mould to move it to the weighing machine and weigh it.",
		"Click on 'Soil Sample' in the apparatus menu to add a soil sample to the mould and weigh them together .",
		"Click on 'Shear Box' in the apparatus menu to add an assembled shear box(including blue porous stones) with the soil sample in it.",
		"Click on 'Shear Device' in the apparatus menu to add a shear device to the workspace.",
		"Click on the shear box to move it to the shear device.",
		"Click on the shear box to start the device and apply a force to shear the soil.",
		"Click the restart button to perform the experiment again.",
	];

	const normalStress = [1.55, 3.14, 4.69];
	let diameter, area;
	let step, translate, lim, objs, keys, enabled, small, flag;
	init();

	const tableData = [
		{ "Horizontal Displacement (cm)": "0.025", "Load Dial Reading": "4", "Horizontal Shear Force (N)": "22.86", "Shear Stress (N/cm<sup>2</sup>)": "" }, 
		{ "Horizontal Displacement (cm)": "0.075", "Load Dial Reading": "4.8", "Horizontal Shear Force (N)": "23.93", "Shear Stress (N/cm<sup>2</sup>)": "" }, 
		{ "Horizontal Displacement (cm)": "0.125", "Load Dial Reading": "7.8", "Horizontal Shear Force (N)": "27.8", "Shear Stress (N/cm<sup>2</sup>)": "" }, 
		{ "Horizontal Displacement (cm)": "0.175", "Load Dial Reading": "16.5", "Horizontal Shear Force (N)": "40.03", "Shear Stress (N/cm<sup>2</sup>)": "" }, 
		{ "Horizontal Displacement (cm)": "0.225", "Load Dial Reading": "21", "Horizontal Shear Force (N)": "46.62", "Shear Stress (N/cm<sup>2</sup>)": "" }, 
		{ "Horizontal Displacement (cm)": "0.275", "Load Dial Reading": "23", "Horizontal Shear Force (N)": "47.99", "Shear Stress (N/cm<sup>2</sup>)": "" }, 
		{ "Horizontal Displacement (cm)": "0.325", "Load Dial Reading": "25.5", "Horizontal Shear Force (N)": "51.06", "Shear Stress (N/cm<sup>2</sup>)": "" }, 
		{ "Horizontal Displacement (cm)": "0.375", "Load Dial Reading": "27", "Horizontal Shear Force (N)": "53.29", "Shear Stress (N/cm<sup>2</sup>)": "" }, 
		{ "Horizontal Displacement (cm)": "0.425", "Load Dial Reading": "27", "Horizontal Shear Force (N)": "52.93", "Shear Stress (N/cm<sup>2</sup>)": "" }, 
	];

	const objNames = Object.keys(objs);
	objNames.forEach(function(elem, ind) {
		const obj = document.getElementById(elem);
		obj.addEventListener('click', function(event) {
			if(elem === "shearBox")
			{
				diameter = randomNumber(6, 7);
				area = (Math.PI * diameter * diameter / 4).toFixed(2);
				document.getElementById("output3").innerHTML = "Shear Box Diameter = " + String(diameter) + " cm";
				document.getElementById("output4").innerHTML = "Shear Box Area, A = " + String(area) + " cm" + "2".sup();

				keys = keys.filter(function(val, index) {
					return val !== "weight" && val !== "mould";
				});
			}

			keys.push(elem);

			if(elem === "soil")
			{
				return;
			}

			step += 1;
		});
	});

	canvas.addEventListener('mousemove', function(event) {check(event, translate, step, false);});
	canvas.addEventListener('click', function(event) {
		step = check(event, translate, step);
	});

	const table = document.getElementsByClassName("table")[0];

	function responsiveTable(x) {
		if(x.matches)	// If media query matches
		{ 
			small = true;
			if(step === enabled.length - 1)
			{
				document.getElementById("observations").style.width = '85%';
			}
		} 

		else
		{
			small = false;
			if(step === enabled.length - 1)
			{
				document.getElementById("observations").style.width = '40%';
			}
		}
	};

	let x = window.matchMedia("(max-width: 1023px)");
	responsiveTable(x); // Call listener function at run time
	x.addListener(responsiveTable); // Attach listener function on state changes	

	function draw()
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height); 
		ctx.lineCap = "round";
		ctx.lineJoin = "round";

		let ctr = 0;
		document.getElementById("main").style.pointerEvents = 'none';

		objNames.forEach(function(name, ind) {
			document.getElementById(name).style.pointerEvents = 'auto';
			if(keys.includes(name) || !(enabled[step].includes(name)))
			{
				document.getElementById(name).style.pointerEvents = 'none';
			}

			if(keys.includes(name)) 
			{
				if(enabled[step].includes(name))
				{
					ctr += 1;
				}
				objs[name].draw(ctx);
			}
		});

		if(ctr === enabled[step].length && !translate[0] && !translate[1])
		{
			document.getElementById("main").style.pointerEvents = 'auto';
		}

		if(step === 3 && keys.includes("soil"))
		{
			translate[1] = -1;
			updatePos(objs['soil'], translate);
			step += objs['soil'].heightChange(-translate[1], 50);
			translate[1] = 0;
			if(step === 4)
			{
				document.getElementById("output2").innerHTML = "Mass of soil = " + String(280) + " g";
			}
		}

		if(translate[0] !== 0 || translate[1] !== 0)
		{
			let temp = step;
			const soilMoves = [6], mouldMoves = [2], shearBoxMoves = [6];

			if(step === 7)
			{
				objs['soil'].shear(translate[0]);
				objs['shearBox'].shear(translate[0]);
				temp += objs['shearDevice'].shear(translate[0]);
			}

			if(mouldMoves.includes(step))
			{
				updatePos(objs['mould'], translate);
				temp = limCheck(objs['mould'], translate, lim, step);
			}

			if(soilMoves.includes(step))
			{
				updatePos(objs['soil'], translate);

				if(!shearBoxMoves.includes(step))
				{
					temp = limCheck(objs['soil'], translate, lim, step);
				}
			}

			if(shearBoxMoves.includes(step))
			{
				updatePos(objs['shearBox'], translate);
				temp = limCheck(objs['shearBox'], translate, lim, step);
			}

			step = temp;
		}

		document.getElementById("procedure-message").innerHTML = msgs[step];
		finish(step);
		tmHandle = window.setTimeout(draw, 1000 / fps);
	};

	let tmHandle = window.setTimeout(draw, 1000 / fps);
});
