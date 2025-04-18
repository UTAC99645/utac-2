for i in *; do
  if [[ ! "$i" =~ .*(.asc|.gpg)$ ]] && [[ $i != "1.zsh" ]] && [[ -f $i ]]; then
    echo $i
    gpg -er UTAC "$i"
    gpg -ear UTAC "$i"
  fi
done
