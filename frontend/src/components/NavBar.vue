<template>
  <div class="affix-container">
    <el-affix target=".affix-container" :offset="80">
      <el-menu
        default-active="1"
        class="el-menu-demo"
        mode="horizontal"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
      >
        <el-menu-item index="1">Index</el-menu-item>
      </el-menu>
    </el-affix>
  </div>
</template>



<script>
export default {
  name: "NavBar"
}
</script>

<style scoped>

</style>