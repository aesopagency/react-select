import React from 'react';
import classNames from 'classnames';

var dragElement = null;
var hoveredElement = null;
var spacer = document.createElement('div');
spacer.className = 'spacer';

const Value = React.createClass({

	displayName: 'Value',

	propTypes: {
		children: React.PropTypes.node,
		sortable: React.PropTypes.bool,
		disabled: React.PropTypes.bool,               // disabled prop passed to ReactSelect
		id: React.PropTypes.string,                   // Unique id for the value - used for aria
		onClick: React.PropTypes.func,                // method to handle click on value label
		onRemove: React.PropTypes.func,               // method to handle removal of the value
		value: React.PropTypes.object.isRequired,     // the option object for this value
	},

	getInitialState () {
		return {
			dragElement: null,
			hoveredElement: null
		};
	},

	handleMouseUp (event) {
		if (dragElement !== null) {
			if(hoveredElement) {
				let currElement = this.getValueElement(hoveredElement);
				let elements = document.getElementsByClassName('Select-value');
				if (currElement === elements[0]) {
					currElement.parentNode.insertBefore(dragElement, currElement);
				} else {
					this.insertAfter(dragElement, currElement)
				}
			}
			spacer.remove();
			dragElement.classList.remove('drag');
			document.onmousemove = null;
			document.onselectstart = null;
			dragElement = null;
		}
	},

	handleMouseDown (event) {
		if (event.type === 'mousedown' && event.button !== 0) {
			return;
		}
		if (this.props.sortable) {
			var parent = event.target.parentElement != null ? event.target.parentElement : event.srcElement;
			parent.className += ' drag';
			dragElement = parent;
			spacer.style.width = dragElement.offsetWidth + 'px';
			document.onmouseup = this.handleMouseUp;
			event.preventDefault();
		}
		if (this.props.onClick) {
			event.stopPropagation();
			this.props.onClick(this.props.value, event);
			return;
		}
		if (this.props.value.href) {
			event.stopPropagation();
		}
	},

	elIndex (el) {
		return Array.prototype.indexOf.call(el.parentElement.childNodes, el);
	},

	handleMouseEnter (event) {
		if (dragElement !== null) {
			hoveredElement = this.getValueElement(event.target);
			if(this.elIndex(dragElement) < this.elIndex(hoveredElement)) {
				dragElement.parentNode.insertBefore(hoveredElement, dragElement);
			} else {
				hoveredElement.parentNode.insertBefore(dragElement, hoveredElement);
			}
		}
	},

	onRemove (event) {
		event.preventDefault();
		event.stopPropagation();
		this.props.onRemove(this.props.value);
	},

	handleTouchEndRemove (event){
		// Check if the view is being dragged, In this case
		// we don't want to fire the click event (because the user only wants to scroll)
		if(this.dragging) return;

		// Fire the mouse events
		this.onRemove(event);
	},

	handleTouchMove (event) {
		// Set a flag that the view is being dragged
		this.dragging = true;
	},

	handleTouchStart (event) {
		// Set a flag that the view is not being dragged
		this.dragging = false;
	},

	getValueElement (element) {
		if (element.className.indexOf('label') > 0 || element.className.indexOf('icon') > 0) {
			return element.parentNode;
		} else {
			return element;
		}
	},

	insertAfter (newNode, referenceNode) {
		referenceNode.parentNode.insertBefore(newNode, referenceNode);
	},

	renderRemoveIcon () {
		if (this.props.disabled || !this.props.onRemove) return;
		return (
			<span className="Select-value-icon"
				aria-hidden="true"
				onMouseDown={this.onRemove}
				onTouchEnd={this.handleTouchEndRemove}
				onTouchStart={this.handleTouchStart}
				onTouchMove={this.handleTouchMove}>
				&times;
			</span>
		);
	},

	renderLabel () {
		let className = 'Select-value-label';
		className += this.props.sortable ? ' move-cursor' : '';
		return this.props.onClick || this.props.value.href ? (
			<a className={className} href={this.props.value.href} target={this.props.value.target} onMouseDown={this.handleMouseDown} onTouchEnd={this.handleMouseDown}>
				{this.props.children}
			</a>
		) : (
			<span className={className} role="option" aria-selected="true" id={this.props.id} onMouseDown={this.handleMouseDown} onTouchEnd={this.handleMouseDown}>
				{this.props.children}
			</span>
		);
	},

	render () {
		return (
			<div className={classNames('Select-value', this.props.value.className)}
				style={this.props.value.style}
				title={this.props.value.title}
				onMouseEnter={this.handleMouseEnter}
				>
				{this.renderRemoveIcon()}
				{this.renderLabel()}
			</div>
		);
	}

});

module.exports = Value;
