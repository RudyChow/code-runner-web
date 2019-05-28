let editorLanguages = {
  'php': {
    'mode': 'application/x-httpd-php',
    'template': `<?php

echo "hello php";`
  },
  'golang': {
    'mode': 'text/x-go',
    'template': `package main

import "fmt"

func main() {
  fmt.Print("hello go")
}`
  },
  'python': {
    'mode': 'text/x-python',
    'template': `#!/usr/bin/python3

print("python3")`
  },
  'c': {
    'mode': 'text/x-c',
    'template': `#include <stdio.h>

int main(){
  printf("hello c");
  return 0;
}`
  },
  'c++': {
    'mode': 'text/x-c++src',
    'template': `#include <iostream>
using namespace std;

int main()
{
  cout << "Hello c++!" << endl;
  return 0;
}`
  },
  'ruby': {
    'mode': 'text/x-ruby',
    'template': `puts 'Hello ruby'`
  },
  'java': {
    'mode': 'text/x-java',
    'template': `class Main {
  public static void main(String[] args) {
    System.out.println("Hello java!");
  }
}`
  }
}

export default editorLanguages
