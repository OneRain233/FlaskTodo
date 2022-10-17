<template>
  <div class="todo_item">
    <el-header>{{ title }}</el-header>
    <el-main>{{ description }}</el-main>
    <el-footer>
      <el-button class="card-button" type="primary" @click="handleClick">Click me</el-button>
    </el-footer>
  </div>
</template>


<script>
export default {
  name: "TodoItem",
  props: {
    title: {
      type: String,
      default: "Todo Item"
    },
    description: {
      type: String,
      default: "Todo Item Description"
    }
  }
}
</script>

<style scoped>
.todo_item {
  width: 70%;
  height: 100%;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12);
  padding: 3px 3px 0;
  margin: auto auto;
}

.card-button {
  margin: 0 auto;
  float: right;

  display: block;
}
</style>