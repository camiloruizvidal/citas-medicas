<script>
export default {
    name: 'logout',
    mounted:function()
    {
        this.$socket.emit('CloseSession', JSON.parse(localStorage.getItem('user')));
        localStorage.clear();
        window.location = 'login'
    }
}
</script>