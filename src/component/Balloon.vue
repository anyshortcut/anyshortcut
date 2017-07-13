<template>
    <div class="balloon"
         :class="balloonClass"
         :style="balloonStyle"
         data-rotate="rotate">
        <div class="content">{{content}}</div>
    </div>
</template>
<style lang="css">
    .balloon {
        display: flex;
        align-content: center;
        justify-content: center;
        border-radius: 80%;
        position: relative;
        border-style: none;
        box-shadow: inset 17px 7px 10px rgba(0, 0, 0, 0.07);
        margin: 20px 10px;
        z-index: 10;
    }

    .animate {
        transition: transform 0.5s ease;
        animation: balloons 4s ease-in-out infinite;
        transform-origin: bottom center;
    }

    .balloon:before {
        width: 0;
        height: 0;
        border-width: 10px;
        border-style: dashed dashed dashed solid;
        border-top-color: transparent;
        border-left-color: transparent;
        border-right-color: transparent;
        border-bottom-color: inherit;
        text-align: center;
        position: absolute;
        bottom: -8px;
        z-index: -1;
        content: '';
    }

    .line:after {
        display: inline-block;
        /*top: 0;*/
        position: absolute;
        height: 160px;
        width: 1px;
        margin: 0 auto;
        content: "";
        background: rgba(0, 0, 0, 0.2);
    }

    .content {
        color: #FFFFFF;
        display: flex;
        align-items: center;
        font-size: 22px;
    }

    @keyframes balloons {
        0%, 100% {
            transform: translateY(0) rotate(-4deg);
        }
        50% {
            transform: translateY(-25px) rotate(4deg);
        }
    }

</style>
<script type="es6">
    export default{
        name: 'Balloon',
        data(){
            return {
                balloonStyle: {
                    background: this.color,
                    borderBottomColor: this.color,
                    width: this.size.width,
                    height: this.size.height,
                },
                balloonClass: {
                    animate: this.animate,
                    line: this.line,
                }
            };
        },
        props: {
            content: {
                type: String,
                default(){
                    return null;
                }
            },
            rotate: {
                type: Number,
                default(){
                    return 0;
                }
            },
            animate: {
                type: Boolean,
                default(){
                    return true;
                }
            },
            line: {
                type: Boolean,
                default(){
                    return true;
                }
            },
            color: {
                type: String,
                default(){
                    return "#4F6EC8";
                }
            },
            size: {
                type: Object,
                default(){
                    return {
                        width: '50px',
                        height: '60px',
                    }
                }
            }
        },
    }
</script>