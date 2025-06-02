<script lang="ts">
    let data = $props();
    console.log('apps page layout loaded');
</script>

<header>This is my apps header</header>
<div
    class="content-control-div"
    style="width: 100%; height: 100%; margin-top: 0.4em;color:white"
>
    <div class="inner-content-control-spacing" style="width: auto;">
        {@render data.children()}
    </div>
</div>
