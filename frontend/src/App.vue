<template>
  <div class="common-layout">
    <el-header>
      <NavBar />
    </el-header>
    <el-container>
      <TodoItem title="12332" description="description">
      </TodoItem>
    </el-container>
    <el-footer>
      Footer
    </el-footer>
  </div>
</template>

<script>
import TodoItem from './components/TodoItem.vue'
import NavBar from "@/components/NavBar";

export default {
  name: 'App',
  components: {
    TodoItem,
    NavBar
  }
}
</script>

