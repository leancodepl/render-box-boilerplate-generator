<script>
import generateCode from './generate';

export default {
  data() {
    return {
      childrenWidgets: [
        { nullable: true, name: 'child' }
      ],
      fields: [
        { type: 'Color', name: 'color' }
      ],
      widgetForm: {
        nullable: false,
        name: '',
      },
      fieldForm: {
        type: '',
        name: '',
      },
      widgetName: '',
      widgetPrivate: false,
      output: '// Output will be here'
    }
  },
  methods: {
    removeWidget(name) {
      this.childrenWidgets = this.childrenWidgets.filter(widget => widget.name != name);
    },
    addWidget() {
      this.childrenWidgets.push({
        nullable: this.widgetForm.nullable,
        name: this.widgetForm.name,
      });

      this.widgetForm.nullable = false;
      this.widgetForm.name = '';
    },
    removeField(name) {
      this.fields = this.fields.filter(widget => widget.name != name);
    },
    addField() {
      this.fields.push({
        type: this.fieldForm.type,
        name: this.fieldForm.name,
      });

      this.fieldForm.type = '';
      this.fieldForm.name = '';
    },
    generate() {
      this.output = generateCode(
        this.widgetName,
        this.widgetPrivate,
        this.childrenWidgets,
        this.fields,
      );
    },
    copy() {
      navigator.clipboard.writeText(this.output);
    }
  }
}
</script>

<template>
  <h1 class="mt-2 text-center">RenderBox boilerplate generator</h1>
  <small class="d-block text-center mb-5">Widget, Element, slots, and RenderBox</small>
  <div class="container">
    <div class="grid">
      <div class="widgets">
        <h2 class="mb-4">Children widgets</h2>
        <ul>
          <li v-for="widget in childrenWidgets">
            <div class="d-flex justify-content-between">
              <code>Widget{{ widget.nullable ? '?' : '' }} {{ widget.name }}</code>
              <button @click="removeWidget(widget.name)" class="btn btn-outline-danger btn-sm">x</button>
            </div>

          </li>
        </ul>

        <form @submit.prevent="addWidget" class="row row-cols-lg-auto g-3 align-items-center">
          <div class="col-12">
            <div class="form-check">
              <input type="checkbox" v-model="widgetForm.nullable" id="children-widget-nullable"
                class="form-check-input">
              <label for="widget-nullable" class="form-check-label">Nullable</label>
            </div>
          </div>

          <div class="col-12">
            <label for="widget-name" class="visually-hidden">Widget name</label>
            <input type="text" v-model="widgetForm.name" id="widget-name" class="form-control" placeholder="Widget name"
              required pattern="[a-z][a-zA-Z_\d]*">
          </div>

          <div class="col-12">
            <button type="submit" class="btn btn-primary">Add</button>
          </div>
        </form>
      </div>


      <div class="fields">
        <h2 class="mb-4">Fields</h2>
        <ul>
          <li v-for="field in fields">
            <div class="d-flex justify-content-between">
              <code>{{ field.type }} {{ field.name }}</code>
              <button @click="removeField(field.name)" class="btn btn-outline-danger btn-sm">x</button>
            </div>
          </li>
        </ul>

        <form @submit.prevent="addField" class="row row-cols-lg-auto g-3 align-items-center">
          <div class="col-12">
            <label for="field-type" class="visually-hidden">Field type</label>
            <input type="text" v-model="fieldForm.type" id="field-type" class="form-control" placeholder="Field type"
              required pattern="(_?[A-Z][a-zA-Z0-9]*|double|int|num|bool)\??">
          </div>

          <div class="col-12">
            <label for="field-name" class="visually-hidden">Field name</label>
            <input type="text" v-model="fieldForm.name" id="field-name" class="form-control" placeholder="Field name"
              required pattern="[a-z][a-zA-Z_\d]*">
          </div>

          <div class="col-12">
            <button type="submit" class="btn btn-primary">Add</button>
          </div>
        </form>
      </div>
    </div>

    <form @submit.prevent="generate" class="mx-auto mt-5 mb-4 row row-cols-lg-auto g-3 align-items-center">
      <div class="col-12">
        <label for="name" class="visually-hidden">Widget name</label>
        <input type="text" v-model="widgetName" class="form-control form-control-lg" placeholder="Widget name" required
          pattern="[A-Z][a-zA-Z0-9]*">
      </div>

      <div class="col-12">
        <div class="form-check">
          <input type="checkbox" v-model="widgetPrivate" id="widget-private" class="form-check-input">
          <label for="widget-private" class="form-check-label">Private</label>
        </div>
      </div>

      <div class="col-12">
        <button class="btn btn-primary btn-lg">Generate</button>
      </div>
    </form>

    <h2 class="mb-3">Output</h2>

    <button @click="copy" class="btn btn-info btn-lg mb-3">Copy to clipboard</button>

    <highlightjs class="p-3 border" language="dart" :code="output"></highlightjs>
  </div>
</template>

<style scoped>
.container {
  margin: 15px auto;
  max-width: 1200px;
}

.grid {
  display: flex;
}

.widgets,
.fields {
  flex: 1;
  margin: 0 15px;
}
</style>
