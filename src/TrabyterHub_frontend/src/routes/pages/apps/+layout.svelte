<script lang="ts">
    let data = $props();
    console.log('apps page layout loaded');
</script>

<div
    class="content-control-div"
    style="width: 100%; height: 100%; margin-top: 1.4rem;color:white"
>
    <div class="inner-content-control-spacing" style="width: auto;">
        {@render data.children()}
    </div>
</div>
