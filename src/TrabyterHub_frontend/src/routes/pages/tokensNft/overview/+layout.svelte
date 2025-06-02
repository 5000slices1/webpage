<script lang="ts">
    let data = $props();
    console.log('NFTs overview page loaded');
</script>

<header>This is my NFTs overview header</header>

<div
    class="content-control-div"
    style="width: 100%; height: 100%; margin-top: 0.4em;max-height:calc(100% - 2em);"
>
    <div class="inner-content-control-spacing" style="width: auto;">
        {@render data.children()}
    </div>
</div>
