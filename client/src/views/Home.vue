<template>
  <div class="container-fluid">
     <button
            type="button"
            class="btn btn-primary"
            @click="openView('epi')"
          > EPI view</button>
       <button
            type="button"
            class="btn btn-primary"
            @click="openView('bio')"
          > BIO view</button>

  </div>
</template>

<script>

export default {
  name: 'Home',
  data: () => ({

  }),
  mounted () {
    this.refresh()
  },
  methods: {
    refresh () {
    },
    openView (view) {
      this.$router.push({ name: view })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
