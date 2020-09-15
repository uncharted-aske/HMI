<template>
  <div class="container-fluid">
     <button
            type="button"
            class="btn btn-primary"
            @click="openView('epiView')"
          > EPI view</button>
       <button
            type="button"
            class="btn btn-primary"
            @click="openView('bioView')"
          > BIO view</button>

  </div>
</template>

<script>

export default {
  name: 'Home',
  methods: {
    openView (view) {
      this.$router.push({ name: view })
    }
  }
}
</script>

<style lang="scss" scoped>
.btn {
  margin: 5px;
}
</style>
