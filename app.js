const budgetController = (() => {
	const Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};
	Expense.prototype.calcPercentages = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.abs((this.value / totalIncome) * 100);
			this.percentage = this.percentage.toFixed(2);
		} else {
			this.percentage = -1;
		}
	};
	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};
	const Income = function(id, description, value) {
	  this.id = id;
	  this.description = description;
	  this.value = value;
	};
	const calculateTotal = (type) => {
		let sum = 0;
		data.allItems[type].forEach((current) => {
			sum += current.value;
		});
		data.totals[type] = sum;
	};
	const data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};
	return {
		addItem: (type, des, val) => {
			let newItem, ID;
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}
			if (type === 'exp') {
				newItem = new Expense(ID, des, val);
			} else if (type === 'inc') {
				newItem = new Income(ID, des, val);
			}
			data.allItems[type].push(newItem);
			return newItem;
		},
		deleteItem: (type, id) => {
			let ids, index;
			ids = data.allItems[type].map((current) => {
				return current.id;
			});
			index = ids.indexOf(id);
			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},
		calculateBudget: () => {
			calculateTotal('exp');
			calculateTotal('inc');
			data.budget = data.totals.inc - data.totals.exp;
			if (data.totals.inc > 0) {
				data.percentage = Math.abs((data.totals.exp / data.totals.inc) * 100);
				data.percentage = data.percentage.toFixed(2);
			} else {
				data.percentage = -1;
			}
		},
		calculatePercentages: () => {
			data.allItems.exp.forEach((cur) => {
				cur.calcPercentages(data.totals.inc);
			});
		},
		getPercentages: () => {
			let allPerc = data.allItems.exp.map((cur) => {
				return cur.getPercentage();
			});
			return allPerc;
		},
		getBudget: () => {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			}
		}
	};
})();

const UIController = (() => {
	const DOMStrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};
	const formatNumber = (num, type) => {
		let numSplit, int, dec;
		num = Math.abs(num);
		num = num.toFixed(2);
		numSplit = num.split('.');
		int = numSplit[0];
		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
		} 
		if (int.length > 6) {
			int = int.substr(0, int.length - 7) + ',' + int.substr(int.length - 7, 7);
		}
		if (int.length > 9) {
			int = int.substr(0, int.length - 11) + ',' + int.substr(int.length - 11, 11);
		}
		dec = numSplit[1];
		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
	};
	const nodeListForEach = (list, callback) => {
		for (let i = 0; i < list.length; i++) {
			callback(list[i], i);
		}
	};
	return {
		getInput: () => {
			return {
				type: document.querySelector(DOMStrings.inputType).value,
				description: document.querySelector(DOMStrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
			};
		},
		addListItem: (obj, type) => {
			let html, newHtml, element;
			if (type === 'inc') {
				element = DOMStrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type === 'exp') {
				element = DOMStrings.expensesContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage"></div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},
		deleteListItem: (selectorID) => {
			let el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},
		clearFields: () => {
			const fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
			const fieldsArr = Array.prototype.slice.call(fields);
			fieldsArr.forEach((current, index, array) => {
				current.value = "";
			});
			fieldsArr[0].focus();
		},
		displayBudget: (obj) => {
			let type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';
			document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
			if (obj.percentage > 0) {
				document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMStrings.percentageLabel).textContent = '---';
			}
		},
		displayPercentages: (percentages) => {
			const fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
			nodeListForEach(fields, (current, index) => {
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';
				}
			});
		},
		displayMonth: () => {
			let now, months, month, year;
			now = new Date();
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			month = now.getMonth();
			year = now.getFullYear();
			document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
		},
		changedType: () => {
			const fields = document.querySelectorAll(DOMStrings.inputType + ',' + DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
			nodeListForEach(fields, (cur) => {
				cur.classList.toggle('red-focus');
			});
			document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
		},
		getDOMStrings: () => {
			return DOMStrings;
		}
	}
})();

const controller = ((budgetCtrl, UICtrl) => {
	const setupEventListener = () => {
		const DOM = UICtrl.getDOMStrings();
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
		document.addEventListener('keypress', (event) => {
			if (event.keyCode === 13) {
				ctrlAddItem();
			}
		});
		document.querySelector(DOM.container).addEventListener('click', ctrDeleteItem);
		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
	};
	const updateBudget = () => {
		budgetCtrl.calculateBudget();
		const budget = budgetCtrl.getBudget();
		UICtrl.displayBudget(budget);
	};
	const updatePercentages = () => {
		budgetCtrl.calculatePercentages();
		const percentages = budgetCtrl.getPercentages();
		UICtrl.displayPercentages(percentages);
	};
	const ctrlAddItem = () => {
		let input, newItem;
		input = UICtrl.getInput();
		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);
			UICtrl.addListItem(newItem, input.type);
			UICtrl.clearFields();
			updateBudget();
			updatePercentages();
		} else {
			alert('The fields are empty!');
		}
	};
	const ctrDeleteItem = (event) => {
		let itemID, splitID, type, ID;
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if (itemID) {
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);
			budgetCtrl.deleteItem(type, ID);
			UICtrl.deleteListItem(itemID);
			updateBudget();
			updatePercentages();
		}
	};
	return {
		init: () => {
			UICtrl.displayMonth();
			setupEventListener();
		}
	};
})(budgetController, UIController);

controller.init();