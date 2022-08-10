export default function (widgetName, privateWidget, childrenWidgets, fields) {
  const name = (privateWidget ? '_' : '') + widgetName;

  let widgetConstructorParams = '';
  for (let widget of childrenWidgets) {
    if (widget.nullable) {
      widgetConstructorParams += `\nthis.${widget.name},`;
    } else {
      widgetConstructorParams += `\nrequired this.${widget.name},`;
    }
  }
  for (let field of fields) {
    if (field.type.endsWith('?')) {
      widgetConstructorParams += `\nthis.${field.name},`;
    } else {
      widgetConstructorParams += `\nrequired this.${field.name},`;
    }
  }

  let widgetFields = '';
  for (let widget of childrenWidgets) {
    if (widget.nullable) {
      widgetFields += `    final Widget? ${widget.name};\n`;
    } else {
      widgetFields += `    final Widget ${widget.name};\n`;
    }
  }
  for (let field of fields) {
    widgetFields += `    final ${field.type} ${field.name};\n`;
  }

  let createRenderObjectParams = '';
  for (let field of fields) {
    createRenderObjectParams += `        ${field.name}: ${field.name},\n`;
  }

  let updateRenderObject = '';
  if (fields.length > 0) {
    updateRenderObject += `      @override
        void updateRenderObject(
            BuildContext context,
            _Render${widgetName} renderObject,
            ) {`;

    if (fields.length === 1) {
      updateRenderObject += `renderObject.${fields[0].name} = ${fields[0].name};\n`;
    } else {
      updateRenderObject += 'renderObject'
      for (let field of fields) {
        updateRenderObject += `\n..${field.name} = ${field.name}`;
      }
      updateRenderObject += ';\n'
    }

    updateRenderObject += '}';
  }

  let slots = '';
  if (childrenWidgets.length > 0) {
    slots += `enum _${widgetName}Slot { `;
    for (let widget of childrenWidgets) {
      slots += `${widget.name}, `;
    }
    slots += '}';
  }

  let elementElementFields = '';
  for (let widget of childrenWidgets) {
    elementElementFields += `Element? ${widget.name}Element;\n`;
  }

  let elementChildrenMethods = '';
  if (childrenWidgets.length > 0) {
    elementChildrenMethods += `@override
        void visitChildren(ElementVisitor visitor) {\n`;
    for (let widget of childrenWidgets) {
      elementChildrenMethods += `if (${widget.name}Element != null) visitor(${widget.name}Element!);\n`;
    }
    elementChildrenMethods += `
    }
  
    @override
    void forgetChild(Element child) {\n`;

    for (let widget of childrenWidgets) {
      if (childrenWidgets.indexOf(widget) === 0) {
        elementChildrenMethods += `if (child.slot == _${widgetName}Slot.${widget.name}) {\n`;
      } else {
        elementChildrenMethods += `} else if (child.slot == _${widgetName}Slot.${widget.name}) {\n`;
      }
      elementChildrenMethods += `${widget.name}Element = null;\n`;
    }

    elementChildrenMethods += `}
        super.forgetChild(child);
      }
    
      @override
      void mount(Element? parent, Object? newSlot) {
        super.mount(parent, newSlot);
        _updateChildren(widget);
      }
    
      @override
      void update(${name} newWidget) {
        super.update(newWidget);
        _updateChildren(newWidget);
      }
    
      void _updateChildren(${name} widget) {\n`;

    for (let widget of childrenWidgets) {
      elementChildrenMethods += `${widget.name}Element = updateChild(
                ${widget.name}Element,
                widget.${widget.name},
                _${widgetName}Slot.${widget.name},
              );\n\n`;
    }

    elementChildrenMethods += `}
    
        @override
        void insertRenderObjectChild(
            RenderObject child,
            _${widgetName}Slot slot,
            ) {
          _updateRenderObjectChild(child, slot);
        }
      
        @override
        void moveRenderObjectChild(
            RenderObject child,
            Object oldSlot,
            Object newSlot,
            ) {
          assert(false);
        }
      
        @override
        void removeRenderObjectChild(
            RenderObject child,
            _${widgetName}Slot slot,
            ) {
          _updateRenderObjectChild(null, slot);
        }
      
        void _updateRenderObjectChild(
            RenderObject? child,
            _${widgetName}Slot slot,
            ) {
          final box = child == null ? null : child as RenderBox;
      `;

    for (let widget of childrenWidgets) {
      if (childrenWidgets.indexOf(widget) === 0) {
        elementChildrenMethods += `if (slot == _${widgetName}Slot.${widget.name}) {\n`;
      } else {
        elementChildrenMethods += `} else if (slot == _${widgetName}Slot.${widget.name}) {\n`;
      }
      elementChildrenMethods += `renderObject.${widget.name} = box;\n`;
    }

    elementChildrenMethods += '}\n}';
  }

  let renderObjectConstructor = '';
  if (fields.length === 0) {
    renderObjectConstructor = `_Render${widgetName}();`;
  } else {
    renderObjectConstructor = `_Render${widgetName}({\n`;
    for (let field of fields) {
      renderObjectConstructor += `required ${field.type} ${field.name},\n`
    }
    renderObjectConstructor += `}) : \n`;
    for (let field of fields) {
      if (fields.indexOf(field) !== 0) {
        renderObjectConstructor += ', ';
      }
      renderObjectConstructor += `_${field.name} = ${field.name}\n`
    }
    renderObjectConstructor += ';';
  }

  let renderBoxBoxes = '';
  for (let widget of childrenWidgets) {
    renderBoxBoxes += `   
        RenderBox? _${widget.name};
        RenderBox? get ${widget.name} => _${widget.name};
        set ${widget.name}(RenderBox? ${widget.name}) {
          if (${widget.name} == _${widget.name}) return;
          if (_${widget.name} != null) dropChild(_${widget.name}!);
          if (${widget.name} != null) adoptChild(${widget.name});
          _${widget.name} = ${widget.name};
          markNeedsLayout();
        }\n`;
  }

  let renderBoxFields = '';
  for (let field of fields) {
    renderBoxFields += `
        ${field.type} _${field.name};
        ${field.type} get ${field.name} => _${field.name};
        set ${field.name}(${field.type} ${field.name}) {
          if (${field.name} == _${field.name}) return;
          _${field.name} = ${field.name};
          markNeedsLayout();
        }\n`;
  }

  let renderBoxWidgetStuff = '';
  if (childrenWidgets.length > 0) {
    let childrenYield = '';
    for (let widget of childrenWidgets) {
      childrenYield += `if (${widget.name} != null) yield ${widget.name}!;\n`;
    }

    let debugDescribe = '';
    for (let widget of childrenWidgets) {
      debugDescribe += `if (${widget.name} != null) ${widget.name}!.toDiagnosticsNode(name: '${widget.name}'),\n`;
    }

    renderBoxWidgetStuff += `Iterable<RenderBox> get _children sync* {
            ${childrenYield}
          }
        
          @override
          void attach(PipelineOwner owner) {
            super.attach(owner);
            for (final child in _children) {
              child.attach(owner);
            }
          }
        
          @override
          void detach() {
            super.detach();
            for (final child in _children) {
              child.detach();
            }
          }
        
          @override
          void redepthChildren() => _children.forEach(redepthChild);
        
          @override
          void visitChildren(RenderObjectVisitor visitor) => _children.forEach(visitor);
        
          @override
          List<DiagnosticsNode> debugDescribeChildren() {
            return [
              ${debugDescribe}
            ];
          }
        
          static BoxParentData _boxParentData(RenderBox? box) =>
              box!.parentData! as BoxParentData;`;
  }

  let paintInner = '// TODO';
  if (childrenWidgets.length > 0) {
    paintInner = `for (final box in _children) {
            context.paintChild(box, _boxParentData(box).offset + offset);
          }`;
  }

  let hitTestChildrenInner = '// TODO';
  if (childrenWidgets.length > 0) {
    hitTestChildrenInner = `for (final box in _children) {
          final isHit = result.addWithPaintOffset(
            offset: _boxParentData(box).offset,
            position: position,
            hitTest: (result, transformed) =>
                box.hitTest(result, position: transformed),
          );
    
          if (isHit) {
            return true;
          }
        }`;
  }


  return `class ${name} extends RenderObjectWidget {
      const ${name}({
        Key? key,${widgetConstructorParams}
      }) : super(key: key);
    
${widgetFields}
    
      @override
      RenderObjectElement createElement() => _${widgetName}Element(this);
    
      @override
      RenderObject createRenderObject(BuildContext context) {
        return _Render${widgetName}(
${createRenderObjectParams});
      }
    
      ${updateRenderObject}
    }
    
    ${slots}
    
    class _${widgetName}Element extends RenderObjectElement {
      _${widgetName}Element(
          ${name} widget,
          ) : super(widget);
    
      ${elementElementFields}
    
      @override
      ${name} get widget =>
          super.widget as ${name};
    
      @override
      _Render${widgetName} get renderObject =>
          super.renderObject as _Render${widgetName};
    
      ${elementChildrenMethods}
    }
    
    class _Render${widgetName} extends RenderBox {
      ${renderObjectConstructor}
    
      ${renderBoxBoxes}
    
      ${renderBoxFields}
    
      ${renderBoxWidgetStuff}
    
      @override
      void performLayout() {
        // TODO
      }
    
      @override
      void paint(PaintingContext context, Offset offset) {
        ${paintInner}
      }
    
      @override
      bool hitTestChildren(BoxHitTestResult result, {required Offset position}) {
        ${hitTestChildrenInner}
    
        return false;
      }
    }
`;
};